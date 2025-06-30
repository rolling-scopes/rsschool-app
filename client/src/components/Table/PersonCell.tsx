import React from 'react';
import { GithubUserLink } from 'components/GithubUserLink';

type Person = { name: string; githubId: string; cityName?: string | null; countryName?: string | null };
type Props = { value: Person; showCountry?: boolean };
export function PersonCell({ value, showCountry }: Props) {
  const hasName = value.name;
  const hasCity = value?.cityName != null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <GithubUserLink value={value.githubId} />
      <small>
        {value.name}
        {hasName && hasCity ? ', ' : ''}
        {value?.cityName}
        {showCountry ? `, ${value.countryName}` : ''}
      </small>
    </div>
  );
}
