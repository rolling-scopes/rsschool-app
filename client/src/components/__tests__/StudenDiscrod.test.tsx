import { render, screen } from '@testing-library/react';
import { Discord } from '@client/api';
import { StudentDiscord } from 'components/StudentDiscord';

describe('StudentDiscord', () => {
  test('renders a Discord user correctly', () => {
    const discord: Discord = {
      id: '123456',
      username: 'TestUser',
      discriminator: '1234',
    };

    render(<StudentDiscord discord={discord} />);

    const userLink = screen.getByText('@TestUser#1234');
    expect(userLink).toBeInTheDocument();
    expect(userLink).toHaveAttribute('href', 'https://discordapp.com/users/123456');
  });

  test('renders "unknown" for null Discord data', () => {
    render(<StudentDiscord discord={null} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  test('renders the text prefix if provided', () => {
    const discord: Discord = {
      id: '123456',
      username: 'TestUser',
      discriminator: '1234',
    };

    render(<StudentDiscord discord={discord} textPrefix="Discord user" />);
    expect(screen.getByText('Discord user')).toBeInTheDocument();
  });
});
