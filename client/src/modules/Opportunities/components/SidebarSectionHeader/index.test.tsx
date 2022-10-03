import { render, screen } from '@testing-library/react';
import { SidebarSectionHeader } from './index';

const mockTitle = 'Some title';

describe('SidebarSectionHeader', () => {
  test('should render title', () => {
    render(<SidebarSectionHeader title={mockTitle} />);

    const title = screen.getByText(mockTitle);

    expect(title).toBeInTheDocument();
  });
});
