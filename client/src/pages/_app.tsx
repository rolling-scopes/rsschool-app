import App from 'next/app';
import Head from 'next/head';

import { ActiveCourseProvider } from 'modules/Course/contexts';
import 'antd/dist/reset.css';
import { initializeFeatures } from 'services/features';
import { Analytics } from '../components/Analytics';
import '../styles/main.css';
import { MessageProvider, ThemeProvider } from '@client/providers';

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
          <MessageProvider>
            <ActiveCourseProvider publicRoutes={['/login', '/registry/mentor', '/registry/student']}>
              <Component {...pageProps} />
            </ActiveCourseProvider>
          </MessageProvider>
        </ThemeProvider>
      </>
    );
  }
}

export default RsSchoolApp;
