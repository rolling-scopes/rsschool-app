import * as React from 'react';
import { Field } from 'react-final-form';
import Select from 'react-select';
import { Label } from 'reactstrap';
import { requiredValidator } from 'components/Forms';
import { Option, SingleValue } from 'components/UserSelect';
import { ValidationError } from 'components/ValidationError';
import { StudentBasic } from 'services/course';

type Person = Pick<StudentBasic, 'id' | 'firstName' | 'lastName' | 'githubId'>;

type Props = {
  data: Person[];
  name: string;
};

export function StudentSelect(props: Props) {
  return (
    <Field name={props.name} validate={requiredValidator}>
      {({ input, meta }) => (
        <>
          <Label>Student</Label>
          <Select
            {...input}
            onChange={(student: any) => input.onChange(student.id)}
            value={props.data.find(student => student.id === input.value)}
            placeholder={'Choose student'}
            getOptionValue={(person: Person) => person.id.toString()}
            components={{ Option, SingleValue }}
            options={props.data}
          />
          <ValidationError meta={meta} />
        </>
      )}
    </Field>
  );
}
