import { render, screen } from '@testing-library/react';
import { UserData } from 'modules/Opportunities/models';
import { NameTitle } from './index';

jest.mock('../AvatarCv', () => ({
  AvatarCv: ({ src }: { src: string }) => <div>{src}</div>,
}));

const mockUserData = {
  name: 'Example name',
  avatarLink: 'https://example.com',
  desiredPosition: 'Example position',
};

describe('NameTitle', () => {
  test('should be displayed correctly', () => {
    render(<NameTitle userData={mockUserData as UserData} />);

    const displayedMockAvatar = screen.getByText(mockUserData.avatarLink);
    const displayedName = screen.getByText(mockUserData.name);
    const displayedPosition = screen.getByText(mockUserData.desiredPosition);

    expect(displayedMockAvatar).toBeInTheDocument();
    expect(displayedName).toBeInTheDocument();
    expect(displayedPosition).toBeInTheDocument();
  });
});
