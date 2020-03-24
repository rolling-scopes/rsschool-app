import React from 'react';
import { GithubUserLink } from 'components/GithubUserLink';

type Person = { name: string; githubId: string; cityName: string };

export function PersonCell(props: { value: Person }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <GithubUserLink value={props.value.githubId} />
      <small>
        {props.value.name}, {props.value?.cityName ?? 'Other'}
      </small>
    </div>
  );
}
