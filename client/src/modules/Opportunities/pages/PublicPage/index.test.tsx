import { render, screen } from '@testing-library/react';
import { ResumeDto } from '@client/api';
import { PublicPage } from './index';

// ViewCV is the heavy CV renderer; stub it to a marker that surfaces publicMode + the
// resume it received so the page's data wiring can be asserted without the real subtree.
vi.mock('@client/modules/Opportunities/components/ViewCv', () => ({
  ViewCV: (props: { publicMode?: boolean; initialData: ResumeDto }) => (
    <div data-testid="view-cv" data-public={String(props.publicMode)}>
      {props.initialData.name}
    </div>
  ),
}));

// next/head renders its children into the test DOM, so the <title> is queryable.
vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('<PublicPage />', () => {
  it('renders the CV in public mode and a title built from the resume name', () => {
    render(<PublicPage data={{ name: 'Jane Doe', uuid: 'abc', avatarLink: '' } as ResumeDto} />);

    const view = screen.getByTestId('view-cv');
    expect(view).toHaveAttribute('data-public', 'true');
    expect(view).toHaveTextContent('Jane Doe');
  });

  it('falls back to the github username when the name is missing', () => {
    render(<PublicPage data={{ name: undefined, githubUsername: 'jane-gh', uuid: 'abc' } as ResumeDto} />);

    // The document <title> is composed from the github username fallback.
    expect(document.title).toContain('jane-gh');
  });

  it('uses the "(Empty)" placeholder title when neither name nor github username exist', () => {
    render(<PublicPage data={{ uuid: 'abc' } as ResumeDto} />);

    expect(document.title).toContain('(Empty)');
  });
});
