import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { LABELS } from 'modules/Registry/constants';
import { Preferences } from './Preferences';

const renderPreferences = () =>
  render(
    <Form>
      <Preferences />
    </Form>,
  );

describe('Preferences', () => {
  test.each`
    value
    ${2}
    ${'any'}
  `('should render form item with $value value', async ({ value }) => {
    renderPreferences();

    const item = await screen.findByDisplayValue(value);
    expect(item).toBeInTheDocument();
  });

  test.each`
    label
    ${LABELS.studentsCount}
    ${LABELS.studentsLocation}
  `('should render field with $label label', async ({ label }) => {
    renderPreferences();

    const fieldLabel = await screen.findByTitle(label);
    expect(fieldLabel).toBeInTheDocument();
  });
});
