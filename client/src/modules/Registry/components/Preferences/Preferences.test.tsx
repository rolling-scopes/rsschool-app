import { cleanup, render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { LABELS } from 'modules/Registry/constants';
import { Preferences } from './Preferences';

const setup = () =>
  render(
    <Form>
      <Preferences />
    </Form>,
  );

describe('Preferences', () => {
  afterEach(() => {
    cleanup();
  });

  test('should render form items with proper values', async () => {
    setup();

    const limit = await screen.findByDisplayValue(2);
    const location = await screen.findByDisplayValue('any');
    expect(limit).toBeInTheDocument();
    expect(location).toBeInTheDocument();
  });

  test.each`
    label
    ${LABELS.studentsCount}
    ${LABELS.studentsLocation}
  `('should render field with $label label', async ({ label }) => {
    setup();
    const fieldLabel = await screen.findByTitle(label);
    expect(fieldLabel).toBeInTheDocument();
  });
});
