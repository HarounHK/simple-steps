import { AuthProvider } from "../app/providers";
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../styles/globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-screen">
      <head>
        <title>Simple Steps</title>
      </head>
      <body className="min-h-screen flex flex-col bg-[#D7AAFA] text-white">
        <AuthProvider>
          <Navbar />
          <div className="flex-grow">
            <main>{children}</main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}