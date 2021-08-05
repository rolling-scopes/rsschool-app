import * as React from 'react';
import App from 'next/app';
import Head from 'next/head';

import 'antd/dist/antd.css';
import '../styles/main.css';

class RsSchoolApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>App / The Rolling Scopes School</title>
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}

export default RsSchoolApp;
