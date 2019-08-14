import * as React from 'react';
import { components } from 'react-select';

type Person = {
  firstName: string;
  lastName: string;
  githubId: string;
};

const formatDisplayValue = (data: Person) => {
  let result = data.githubId;
  if (data.firstName || data.lastName) {
    result = `${result} (${data.firstName} ${data.lastName})`;
  }
  return result;
};

export const GithubAvatar = (props: { githubId: string }) => (
  <img className="select-avatar" src={`https://github.com/${props.githubId}.png`} />
);

export const Option = (props: any) => {
  const data: Person = props.data;
  return (
    <components.Option {...props} key={data.githubId}>
      <GithubAvatar githubId={data.githubId} />
      {formatDisplayValue(data)}
    </components.Option>
  );
};

export const SingleValue = (props: any) => {
  const data: Person = props.data;
  return (
    <components.SingleValue {...props} value={data.githubId}>
      <GithubAvatar githubId={data.githubId} />
      {formatDisplayValue(data)}
    </components.SingleValue>
  );
};
