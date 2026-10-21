import { render, screen } from '@testing-library/react';
import { PersonCell } from './PersonCell';

// PersonCell renders a GithubUserLink, which depends on react-use's clipboard hook.
vi.mock('react-use', () => ({
  useCopyToClipboard: () => [{ value: undefined }, vi.fn()],
}));

describe('PersonCell', () => {
  const person = { name: 'Octo Cat', githubId: 'octocat', cityName: 'Minsk', countryName: 'Belarus' };

  it('renders profile and location details for each supported state', () => {
    const { rerender } = render(<PersonCell value={person} />);

    expect(screen.getByTitle('Open Rolling Scopes App profile page')).toHaveAttribute(
      'href',
      '/profile?githubId=octocat',
    );
    expect(screen.getByText(/Octo Cat/)).toBeInTheDocument();
    expect(screen.getByText(/, Minsk/)).toBeInTheDocument();
    expect(screen.queryByText(/Belarus/)).not.toBeInTheDocument();

    rerender(<PersonCell value={person} showCountry />);

    expect(screen.getByText(/, Belarus/)).toBeInTheDocument();

    rerender(<PersonCell value={{ name: 'NoCity', githubId: 'nc', cityName: null }} />);

    expect(screen.getByText('NoCity')).toBeInTheDocument();
    expect(screen.queryByText(/, /)).not.toBeInTheDocument();
  });
});
