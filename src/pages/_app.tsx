import { AuthProvider } from "../app/providers";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: any) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
