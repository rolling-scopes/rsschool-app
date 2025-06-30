import * as React from 'react';
import Head from 'next/head';
import { mapsApiKey } from 'configs/gcp';

const url = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&language=en`;

function withGoogleMaps<T = object>(WrappedComponent: React.ComponentType<T>) {
  return class extends React.Component<T> {
    render() {
      return (
        <>
          {mapsApiKey && (
            <Head>
              <script async src={url}></script>
            </Head>
          )}
          <WrappedComponent {...this.props} />
        </>
      );
    }
  };
}

export { withGoogleMaps };
