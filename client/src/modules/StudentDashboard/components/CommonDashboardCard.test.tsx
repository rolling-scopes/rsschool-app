// The "more" action is an antd icon with no accessible name/role, so the actions list and icon
// are located by class via the container — direct node access is intentional here.
/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CommonCard from './CommonDashboardCard';

describe('<CommonDashboardCard />', () => {
  it('renders content, empty state, and optional more action', () => {
    const { container, rerender } = render(<CommonCard title="My Card" content={<p>Hello content</p>} />);

    expect(screen.getByRole('heading', { name: 'My Card' })).toBeInTheDocument();
    expect(screen.getByText('Hello content')).toBeInTheDocument();

    rerender(<CommonCard title="Empty Card" noDataDescription="Nothing here yet" />);

    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();

    rerender(<CommonCard title="More Card" content={<p>body</p>} isMoreContent />);

    // The fullscreen icon is rendered inside the card actions list.
    expect(container.querySelector('.anticon-fullscreen')).toBeTruthy();
    expect(container.querySelector('.ant-card-actions')).toBeTruthy();

    rerender(<CommonCard title="No More Card" content={<p>body</p>} />);

    expect(container.querySelector('.ant-card-actions')).toBeFalsy();
  });
});
