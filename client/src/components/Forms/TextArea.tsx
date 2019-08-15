import * as React from 'react';
import { Field } from 'react-final-form';
import { Input, Label } from 'reactstrap';
import { ValidationError } from 'components/ValidationError';

type Props = {
  field: string;
  label: string;
  validate?: any;
};

export function TextArea(props: Props) {
  return (
    <Field name={props.field} validate={props.validate}>
      {({ meta, input }) => (
        <>
          <Label>{props.label}</Label>
          <Input {...input} name={props.field} type="textarea" />
          <ValidationError meta={meta} />
        </>
      )}
    </Field>
  );
}
