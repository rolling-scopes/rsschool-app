import * as React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';

export default class extends Document {
  enableGA = process.env.NODE_ENV === 'production';

  render() {
    return (
      <html lang="en">
        <Head>
          <link rel="shortcut icon" href="https://rs.school/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

          {this.enableGA && <script async src="https://www.googletagmanager.com/gtag/js?id=UA-55428637-3" />}
          {this.enableGA && <script dangerouslySetInnerHTML={{ __html: gaJsCode }} />}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

const gaJsCode = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-55428637-3');
`;
