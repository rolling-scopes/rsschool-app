import App from 'next/app';
import Head from 'next/head';

import 'antd/dist/reset.css';
import { initializeFeatures } from 'services/features';
import { Analytics } from '../components/Analytics';
import '../styles/main.css';
import { ThemeProvider } from '@client/providers/ThemeProvider';

class RsSchoolApp extends App {
  render() {
    const { Component, pageProps, router } = this.props;
    initializeFeatures(router.query);

    return (
      <>
        <Analytics />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>App / The Rolling Scopes School</title>
        </Head>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </>
    );
  }
}

export default RsSchoolApp;
