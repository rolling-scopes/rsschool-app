import * as React from 'react';
import { Field } from 'react-final-form';
import { Input, Label } from 'reactstrap';
import { ValidationError } from 'components/ValidationError';
import { commentValidator } from './validators';

type Props = {
  minLength?: number;
};

export function CommentInput(props: Props) {
  const validator = props.minLength ? commentValidator : undefined;
  return (
    <Field name="comment" validate={validator}>
      {({ meta, input }) => (
        <>
          <Label>Comment</Label>
          <Input {...input} name="comment" type="textarea" />
          <ValidationError meta={meta} />
        </>
      )}
    </Field>
  );
}
