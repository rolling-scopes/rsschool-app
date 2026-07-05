import { render, screen } from '@testing-library/react';
import { Typography } from 'antd';
import { FormCard } from './FormCard';

const { Title } = Typography;

describe('FormCard', () => {
  test('renders a plain string title in the card head', () => {
    render(<FormCard title="Personal information" />);

    expect(screen.getByText('Personal information')).toBeInTheDocument();
  });

  test('renders a Typography Title node as an accessible heading (real usage)', () => {
    render(<FormCard title={<Title level={5}>Contact information</Title>} />);

    expect(screen.getByRole('heading', { name: 'Contact information' })).toBeInTheDocument();
  });

  test('renders its children inside the card body', () => {
    render(
      <FormCard title="Course details">
        <p>child content</p>
      </FormCard>,
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  test('renders without children', () => {
    render(<FormCard title="Empty card" />);

    expect(screen.getByText('Empty card')).toBeInTheDocument();
  });
});
