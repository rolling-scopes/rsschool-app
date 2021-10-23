import * as React from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';

const enableAnalytics = process.env.NODE_ENV === 'production';

export default class extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="shortcut icon" href="https://rs.school/favicon.ico" />

          {enableAnalytics && <script async src="https://www.googletagmanager.com/gtag/js?id=UA-55428637-3" />}
          {enableAnalytics && <script dangerouslySetInnerHTML={{ __html: gaJsCode }} />}
          {enableAnalytics && (
            <script
              defer
              src="https://static.cloudflareinsights.com/beacon.min.js"
              data-cf-beacon={'{"token": "e607238d732c4713b01b851ed3df61c2"}'}
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

const gaJsCode = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-55428637-3');
`;
