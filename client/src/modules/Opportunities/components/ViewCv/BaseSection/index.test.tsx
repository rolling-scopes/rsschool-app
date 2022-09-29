import { render, screen } from '@testing-library/react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { BaseSection } from './index';

const mockTestId = 'test-id';
const mockTitle = 'Some title';
const mockIcon = <ExclamationCircleOutlined data-testid={mockTestId} />;

describe('BaseSection', () => {
  test('should display title and icon if provided', () => {
    render(<BaseSection title={mockTitle} icon={mockIcon} />);

    const title = screen.getByText(mockTitle);
    const icon = screen.getByTestId(mockTestId);

    expect(title).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });

  test('should render children if provided', () => {
    const MockChild = () => <div>Some child</div>;

    render(
      <BaseSection>
        <MockChild />
      </BaseSection>,
    );

    const child = screen.getByText('Some child');

    expect(child).toBeInTheDocument();
  });
});
