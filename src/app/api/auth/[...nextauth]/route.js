import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/user";

// Configuration for NextAuth Authentication
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Authentication logic
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB(); // This makes sure MongoDB is connectef

          //Finds the user in the database using Email
          const existingUser = await User.findOne({ email });
          if (!existingUser) {
            console.error("User was not found");
            return null;
          }

          // Validates password by comparing with the hashed password in DataBase
          const passwordsMatch = await bcrypt.compare(password, existingUser.password);
          if (!passwordsMatch) {
            console.error("Password Do not match");
            return null;
          }

          // This returns authenticated user data
          return {
            id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
          };
        } catch (error) {
          console.error("User is not Authorized:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Stores user ID in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; 
      }
      return token;
    },
    // Adds user ID to the session object
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id; 
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",  // Uses JWT for managing the session
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", 
  },
};

const authHandler = NextAuth(authOptions);
export { authHandler as GET, authHandler as POST }; 