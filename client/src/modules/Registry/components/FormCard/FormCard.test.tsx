import { render, screen } from '@testing-library/react';
import { Typography } from 'antd';
import { FormCard } from './FormCard';

const { Title } = Typography;

vi.mock('antd', () => ({
  Card: ({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) => (
    <section>
      <header>{title}</header>
      {children}
    </section>
  ),
  Typography: { Title: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5> },
}));

describe('FormCard', () => {
  test('renders string and heading titles with optional body content', () => {
    const { rerender } = render(
      <FormCard title="Personal information">
        <p>child content</p>
      </FormCard>,
    );

    expect(screen.getByText('Personal information')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();

    rerender(<FormCard title={<Title level={5}>Contact information</Title>} />);

    expect(screen.getByRole('heading', { name: 'Contact information' })).toBeInTheDocument();
    expect(screen.queryByText('child content')).not.toBeInTheDocument();
  });
});
