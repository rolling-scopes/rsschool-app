import * as React from 'react';
import Head from 'next/head';
import { mapsApiKey } from 'configs/gcp';

function withGoogleMaps(WrappedComponent: React.ComponentType<any>) {
  return class extends React.Component<any> {
    render() {
      return (
        <>
          {mapsApiKey && (
            <Head>
              <script src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&language=en`}></script>
            </Head>
          )}
          <WrappedComponent {...this.props} />
        </>
      );
    }
  };
}

export { withGoogleMaps };
