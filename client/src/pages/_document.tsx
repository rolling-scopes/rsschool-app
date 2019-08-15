import * as React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';

export default class extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <title>App / The Rolling Scopes School</title>
          <link rel="shortcut icon" href="https://rs.school/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
