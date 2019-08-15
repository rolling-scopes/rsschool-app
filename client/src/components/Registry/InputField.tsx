import * as React from 'react';

import { FormGroup, Input, Label } from 'reactstrap';
import { Field } from 'react-final-form';
import { InputType } from 'reactstrap/lib/Input';
import { ValidationError } from 'components/ValidationError';

type InputFieldProps = {
  name: string;
  label: string;
  type?: InputType;
  isRequired?: boolean;
};

const required = (value: any) => (value ? undefined : 'Required');

const InputField = ({ name, label, type = 'text', isRequired = true }: InputFieldProps) => (
  <Field type={type === 'checkbox' ? 'checkbox' : ''} name={name} validate={isRequired ? required : () => {}}>
    {({ input, meta }) => (
      <FormGroup className="col-md-6">
        {type !== 'checkbox' && (
          <>
            <Label for={name}>{label}</Label>
            <Input {...input} name={name} type={type} id={name} />
          </>
        )}
        {type === 'checkbox' && (
          <FormGroup check={true}>
            <Input {...input} name={name} type={type} id={name} />
            <Label for={name}>{label}</Label>
          </FormGroup>
        )}
        <ValidationError meta={meta} />
      </FormGroup>
    )}
  </Field>
);

export default InputField;
