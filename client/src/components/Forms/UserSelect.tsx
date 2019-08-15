import * as React from 'react';
import { Field } from 'react-final-form';
import Select from 'react-select';
import { Label } from 'reactstrap';
import { requiredValidator } from 'components/Forms';
import { Option, SingleValue } from 'components/UserSelect';
import { ValidationError } from 'components/ValidationError';
import { User } from 'services/user';

type Person = Pick<User, 'id' | 'githubId'>;

type Props = {
  data: Person[];
  field: string;
  label?: string;
};

export function UserSelect(props: Props) {
  return (
    <Field name={props.field} validate={requiredValidator}>
      {({ input, meta }) => (
        <>
          <Label>{props.label || 'User'}</Label>
          <Select
            {...input}
            onChange={(user: any) => input.onChange(user.id)}
            value={props.data.find(user => user.id === input.value)}
            placeholder={'Choose user'}
            getOptionValue={(user: Person) => user.githubId.toString()}
            components={{ Option, SingleValue }}
            options={props.data}
          />
          <ValidationError meta={meta} />
        </>
      )}
    </Field>
  );
}
