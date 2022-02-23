import * as React from 'react';
import NoConsentViewCV from '../../../components/cv/NoConsentViewCV';
import ViewCV from './ViewCV';

type ResumeProps = {
  githubId: string;
  consent: boolean;
};

export function ViewResume(props: ResumeProps) {
  const { githubId, consent } = props;
  if (consent) {
    return <ViewCV githubId={githubId} />;
  }
  return <NoConsentViewCV />;
}
