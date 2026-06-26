/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { PageLayout, PageLayoutSimple, AdminPageLayout } from './PageLayout';

// Header and AdminSider are heavy (contexts, router, navigation links) and have
// their own tests — stub them so we exercise only PageLayout's own branches.
vi.mock('./Header', () => ({
  Header: ({ title }: { title?: string }) => <div data-testid="header">{title}</div>,
}));
vi.mock('./Sider/AdminSider', () => ({
  AdminSider: () => <div data-testid="admin-sider" />,
}));

describe('PageLayout', () => {
  it('renders the header and children when there is no error', () => {
    render(
      <PageLayout loading={false} title="Dashboard">
        <div>Body content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId('header')).toHaveTextContent('Dashboard');
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders a 500 result with a back-home link when an error is provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <PageLayout loading={false} error={new Error('boom')}>
        <div>Body content</div>
      </PageLayout>,
    );

    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/');
    expect(screen.queryByText('Body content')).not.toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('shows a spinner while loading', () => {
    const { container } = render(
      <PageLayout loading={true}>
        <div>Body content</div>
      </PageLayout>,
    );

    expect(container.querySelector('.ant-spin-spinning')).toBeInTheDocument();
  });
});

describe('PageLayoutSimple', () => {
  it('renders children inside the responsive grid when there is data', () => {
    render(
      <PageLayoutSimple loading={false}>
        <div>Simple body</div>
      </PageLayoutSimple>,
    );

    expect(screen.getByText('Simple body')).toBeInTheDocument();
    expect(screen.queryByText('no data')).not.toBeInTheDocument();
  });

  it('renders a "no data" message when noData is set', () => {
    render(
      <PageLayoutSimple loading={false} noData>
        <div>Simple body</div>
      </PageLayoutSimple>,
    );

    expect(screen.getByText('no data')).toBeInTheDocument();
    expect(screen.queryByText('Simple body')).not.toBeInTheDocument();
  });
});

describe('AdminPageLayout', () => {
  it('renders the header, the admin sider and children', () => {
    render(
      <AdminPageLayout loading={false} title="Admin" courses={[]}>
        <div>Admin body</div>
      </AdminPageLayout>,
    );

    expect(screen.getByTestId('header')).toHaveTextContent('Admin');
    expect(screen.getByTestId('admin-sider')).toBeInTheDocument();
    expect(screen.getByText('Admin body')).toBeInTheDocument();
  });
});
