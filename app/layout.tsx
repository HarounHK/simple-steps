import { AuthProvider } from "../app/providers";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Simple Steps</title>
      </head>
      <body className="bg-black text-white">
        <AuthProvider>
          <Navbar />
          <main className="text-white">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}