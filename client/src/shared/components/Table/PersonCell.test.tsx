import { render, screen } from '@testing-library/react';
import { PersonCell } from './PersonCell';

// PersonCell renders a GithubUserLink, which depends on react-use's clipboard hook.
vi.mock('react-use', () => ({
  useCopyToClipboard: () => [{ value: undefined }, vi.fn()],
}));

describe('PersonCell', () => {
  const person = { name: 'Octo Cat', githubId: 'octocat', cityName: 'Minsk', countryName: 'Belarus' };

  it('renders the github profile link for the person', () => {
    render(<PersonCell value={person} />);

    expect(screen.getByTitle('Open Rolling Scopes App profile page')).toHaveAttribute(
      'href',
      '/profile?githubId=octocat',
    );
  });

  it('renders name and city, joined by a comma', () => {
    render(<PersonCell value={person} />);

    expect(screen.getByText(/Octo Cat/)).toBeInTheDocument();
    expect(screen.getByText(/, Minsk/)).toBeInTheDocument();
  });

  it('appends the country when showCountry is set', () => {
    render(<PersonCell value={person} showCountry />);

    expect(screen.getByText(/, Belarus/)).toBeInTheDocument();
  });

  it('does not render the country by default', () => {
    render(<PersonCell value={person} />);

    expect(screen.queryByText(/Belarus/)).not.toBeInTheDocument();
  });

  it('omits the comma separator when the city is missing', () => {
    render(<PersonCell value={{ name: 'NoCity', githubId: 'nc', cityName: null }} />);

    expect(screen.getByText('NoCity')).toBeInTheDocument();
    expect(screen.queryByText(/, /)).not.toBeInTheDocument();
  });
});
