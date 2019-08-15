import * as React from 'react';

import { FormGroup, Input, Label } from 'reactstrap';
import { Field } from 'react-final-form';
import { ValidationError } from 'components/ValidationError';

type Option = {
  value: string;
  label: string;
};

type DropdownFieldProps = {
  name: string;
  label: string;
  options?: Option[];
  isRequired?: boolean;
};

const required = (value: any) => (value ? undefined : 'Required');

const DropdownField = ({ name, label, options = [], isRequired = true }: DropdownFieldProps) => (
  <Field name={name} validate={isRequired ? required : () => {}}>
    {({ input, meta }) => (
      <FormGroup className="col-md-6">
        <Label>{label}</Label>
        <Input {...input} type="select">
          {options.map((option, i) => (
            <option value={option.value} key={i}>
              {option.label}
            </option>
          ))}
        </Input>
        <ValidationError meta={meta} />
      </FormGroup>
    )}
  </Field>
);

export default DropdownField;
