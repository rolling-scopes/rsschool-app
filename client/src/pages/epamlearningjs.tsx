import { NextPageContext } from 'next';
import * as React from 'react';

export default class EpamLearningJsPage extends React.Component {

  static async getInitialProps(context: NextPageContext) {
    context.res?.writeHead(302, { Location: '/registry/pre-check?course=epamlearningjs' });
    context.res?.end();
    return {};
  }

  render() {
    return <div />;
  }
}
