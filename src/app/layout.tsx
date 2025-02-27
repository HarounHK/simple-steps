import { AuthProvider } from "../app/providers";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Simple Steps</title>
      </head>
      <body className="bg-gray-100">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
