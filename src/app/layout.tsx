import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Simple Steps</title>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}