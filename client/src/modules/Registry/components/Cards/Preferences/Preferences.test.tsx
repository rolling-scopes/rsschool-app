import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { LABELS } from '@client/modules/Registry/constants';
import { Preferences } from './Preferences';

const renderPreferences = () =>
  render(
    <Form>
      <Preferences />
    </Form>,
  );

describe('Preferences', () => {
  test('should render preference values and labels', async () => {
    renderPreferences();

    expect(await screen.findByDisplayValue(2)).toBeInTheDocument();
    expect(screen.getByDisplayValue('any')).toBeInTheDocument();
    expect(screen.getByTitle(LABELS.studentsCount)).toBeInTheDocument();
    expect(screen.getByTitle(LABELS.studentsLocation)).toBeInTheDocument();
  });
});
