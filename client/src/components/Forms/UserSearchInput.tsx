import { Option, SingleValue } from 'components/UserSelect';
import { ValidationError } from 'components/ValidationError';
import * as React from 'react';
import { Field } from 'react-final-form';
// @ts-ignore
import AsyncSelect from 'react-select/async';
import { Label } from 'reactstrap';
import { User } from 'services/user';
import { requiredValidator } from './validators';

export function UserSearchInput({
  searchUsers,
  field,
}: {
  field?: string;
  searchUsers: (query: string) => Promise<User[]>;
}) {
  return (
    <Field name={field || 'user'} validate={requiredValidator}>
      {({ meta, input }) => (
        <>
          <Label>User</Label>
          <AsyncSelect
            placeholder={'Github ID'}
            noOptionsMessage={() => 'Start typing...'}
            getOptionValue={(user: User) => user.githubId}
            components={{ Option, SingleValue }}
            cacheOptions={true}
            loadOptions={searchUsers}
            onChange={(value: any) => input.onChange(value)}
          />
          <ValidationError meta={meta} />
        </>
      )}
    </Field>
  );
}
