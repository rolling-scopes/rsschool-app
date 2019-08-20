import * as React from 'react';
import App from 'next/app';
import Head from 'next/head';

import '../styles/main.scss';
import 'antd/dist/antd.css';

class RsSchoolApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>App / The Rolling Scopes School</title>
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}

export default RsSchoolApp;
