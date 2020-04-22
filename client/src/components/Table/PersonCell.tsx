import React from 'react';
import { GithubUserLink } from 'components/GithubUserLink';

type Person = { name: string; githubId: string; cityName: string };

export function PersonCell(props: { value: Person }) {
  const hasName = !!props.value.name;
  const hasCity = props.value?.cityName != null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <GithubUserLink value={props.value.githubId} />
      <small>
        {props.value.name}
        {hasName && hasCity ? ', ' : ''}
        {props.value?.cityName}
      </small>
    </div>
  );
}
