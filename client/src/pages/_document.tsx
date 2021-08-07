import * as React from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';

const enableGA = process.env.NODE_ENV === 'production';

export default class extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="shortcut icon" href="https://rs.school/favicon.ico" />

          {enableGA && <script async src="https://www.googletagmanager.com/gtag/js?id=UA-55428637-3" />}
          {enableGA && <script dangerouslySetInnerHTML={{ __html: gaJsCode }} />}
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
