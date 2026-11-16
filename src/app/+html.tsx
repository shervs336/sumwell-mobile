import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";
import { type PropsWithChildren } from "react";

// Web only: the HTML shell for every statically rendered page. Runs in Node at export time.
const TITLE = "Sumwell Mobile: your money, in your pocket";
const DESCRIPTION =
  "The Expo and React Native companion to the Sumwell finance dashboard: quick-add transactions, budgets and insights, saved on your device.";

// Matches the app background before the scripts load, so dark mode doesn't flash white.
const background = `
body { background: #f5f5f2; }
@media (prefers-color-scheme: dark) { body { background: #0c0d10; } }
`;

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#4f44d4" />
        <meta property="og:title" content="Sumwell Mobile" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: background }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
