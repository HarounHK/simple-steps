import {AuthProvider} from "../app/providers"
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Simple Steps</title>
      </head>
      <body>
        <main>
          <AuthProvider>
          {children}
          </AuthProvider>
          </main>
      </body>
    </html>
  );
}