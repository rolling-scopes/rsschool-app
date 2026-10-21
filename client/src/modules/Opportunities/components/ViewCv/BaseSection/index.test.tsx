import { render, screen } from '@testing-library/react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { BaseSection } from './index';

const mockTestId = 'test-id';
const mockTitle = 'Some title';
const mockIcon = <ExclamationCircleOutlined data-testid={mockTestId} />;

describe('BaseSection', () => {
  test('renders the title, icon, and children', () => {
    const { rerender } = render(<BaseSection title={mockTitle} icon={mockIcon} />);

    const title = screen.getByText(mockTitle);
    const icon = screen.getByTestId(mockTestId);

    expect(title).toBeInTheDocument();
    expect(icon).toBeInTheDocument();

    rerender(
      <BaseSection>
        <div>Some child</div>
      </BaseSection>,
    );

    const child = screen.getByText('Some child');

    expect(child).toBeInTheDocument();
  });
});
