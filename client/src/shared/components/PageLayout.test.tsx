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
  it('renders content, error, loading, and custom layout states', () => {
    const { container, rerender } = render(
      <PageLayout loading={false} title="Dashboard">
        <div>Body content</div>
      </PageLayout>,
    );
    expect(screen.getByTestId('header')).toHaveTextContent('Dashboard');
    expect(screen.getByText('Body content')).toBeInTheDocument();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    rerender(
      <PageLayout loading={false} error={new Error('boom')}>
        <div>Body content</div>
      </PageLayout>,
    );
    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/');
    expect(screen.queryByText('Body content')).not.toBeInTheDocument();
    errorSpy.mockRestore();

    rerender(
      <PageLayout loading={true}>
        <div>Body content</div>
      </PageLayout>,
    );
    expect(container.querySelector('.ant-spin-spinning')).toBeInTheDocument();

    rerender(
      <PageLayout loading={false} background="rgb(255, 0, 0)" withMargin={false}>
        <div>Body content</div>
      </PageLayout>,
    );
    expect(container.querySelector('.ant-layout')).toHaveStyle({ background: 'rgb(255, 0, 0)' });
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('PageLayoutSimple', () => {
  it('renders data, no-data, and custom-background states', () => {
    const { container, rerender } = render(
      <PageLayoutSimple loading={false}>
        <div>Simple body</div>
      </PageLayoutSimple>,
    );
    expect(screen.getByText('Simple body')).toBeInTheDocument();
    expect(screen.queryByText('no data')).not.toBeInTheDocument();

    rerender(
      <PageLayoutSimple loading={false} noData>
        <div>Simple body</div>
      </PageLayoutSimple>,
    );
    expect(screen.getByText('no data')).toBeInTheDocument();
    expect(screen.queryByText('Simple body')).not.toBeInTheDocument();

    rerender(
      <PageLayoutSimple loading={false} background="rgb(0, 0, 255)">
        <div>Simple body</div>
      </PageLayoutSimple>,
    );
    expect(container.querySelector('.ant-layout')).toHaveStyle({ background: 'rgb(0, 0, 255)' });
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
