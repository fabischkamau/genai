import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,

} from "@remix-run/react";
import "./tailwind.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function Layout({ children }: { children: React.ReactNode }) {


  return (
    <GoogleOAuthProvider clientId="900174728297-b3asta45ta4h7vbvlpd9dqdkjvubuule.apps.googleusercontent.com">
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          {children}
         
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}

export default function App() {
  return <Outlet />;
}
