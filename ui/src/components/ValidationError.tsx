import * as React from 'react';
import { Alert } from 'reactstrap';

export function ValidationError(props: any) {
  const { meta } = props;
  if (!meta.error || !meta.touched) {
    return null;
  }
  return <Alert color="danger">{meta.error}</Alert>;
}
