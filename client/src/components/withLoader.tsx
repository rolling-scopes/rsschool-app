import * as React from 'react';
import { LoadingScreen } from './LoadingScreen';

export const withLoader = ({ type }: any) => (WrappedComponent: React.ComponentType) => (props: any) => {
  if (type === 'display') {
    return (
      <React.Fragment>
        <LoadingScreen show={props.isLoading} />
        <WrappedComponent {...props} />
      </React.Fragment>
    );
  } else if (type === 'replace') {
    return props.isLoading ? <LoadingScreen show={props.isLoading} /> : <WrappedComponent {...props} />;
  }
};
