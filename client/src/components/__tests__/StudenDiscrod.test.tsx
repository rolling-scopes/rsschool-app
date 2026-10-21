import { render, screen } from '@testing-library/react';
import { Discord } from '@client/api';
import { StudentDiscord } from '@client/components/StudentDiscord';

describe('StudentDiscord', () => {
  test('renders populated, empty, and prefixed Discord data', () => {
    const discord: Discord = {
      id: '123456',
      username: 'TestUser',
      discriminator: '1234',
    };

    const { rerender } = render(<StudentDiscord discord={discord} />);

    const userLink = screen.getByText('@TestUser#1234');
    expect(userLink).toBeInTheDocument();
    expect(userLink).toHaveAttribute('href', 'https://discordapp.com/users/123456');

    rerender(<StudentDiscord discord={null} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();

    rerender(<StudentDiscord discord={discord} textPrefix="Discord user" />);
    expect(screen.getByText('Discord user')).toBeInTheDocument();
  });
});
