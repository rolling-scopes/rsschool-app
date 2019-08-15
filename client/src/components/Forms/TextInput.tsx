import * as React from 'react';
import { Field } from 'react-final-form';
import { Input, Label } from 'reactstrap';
import { ValidationError } from 'components/ValidationError';
import { requiredValidator } from './validators';

type Props = {
  field: string;
  label: string;
  required?: boolean;
};

export function TextInput(props: Props) {
  return (
    <Field name={props.field} validate={props.required ? requiredValidator : undefined}>
      {({ meta, input }) => (
        <>
          <Label>{props.label}</Label>
          <Input {...input} name={props.field} type="text" />
          <ValidationError meta={meta} />
        </>
      )}
    </Field>
  );
}
