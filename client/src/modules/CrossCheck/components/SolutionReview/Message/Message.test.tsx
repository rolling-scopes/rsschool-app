import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Message, { MessageProps } from './Message';
import { CrossCheckMessageDtoRoleEnum } from 'api';

const messageProps: MessageProps = {
  reviewNumber: 1,
  message: {
    timestamp: '2022-03-15T00:00:00.000Z',
    content: 'Lorem ipsum',
    author: { id: 12, githubId: 'John Doe' },
    role: CrossCheckMessageDtoRoleEnum.Student,
    isReviewerRead: true,
    isStudentRead: true,
  },
  currentRole: CrossCheckMessageDtoRoleEnum.Student,
  settings: {
    areContactsVisible: true,
  },
};

describe('Message', () => {
  test('Should render author name', () => {
    render(<Message {...messageProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('Should render formatted timestamp', () => {
    render(<Message {...messageProps} />);

    expect(screen.getByText('2022-03-15 00:00')).toBeInTheDocument();
  });

  test('Should render role tag', () => {
    render(<Message {...messageProps} />);

    expect(screen.getByText(messageProps.message.role)).toBeInTheDocument();
  });

  test('Should render prepared comment with correct content', () => {
    render(<Message {...messageProps} />);

    const comment = screen.getByText('Lorem ipsum');
    expect(comment).toBeInTheDocument();
  });

  test('Should render UserAvatar with correct size and role', () => {
    render(<Message {...messageProps} />);

    const userAvatar = screen.getByTestId('user-avatar');
    expect(userAvatar.style.getPropertyValue('width')).toBe('24px');
    expect(userAvatar.style.getPropertyValue('height')).toBe('24px');

    // Assuming role is passed as data-role attribute to the UserAvatar element
    expect(userAvatar).toHaveAttribute('data-role', messageProps.message.role);
  });

  test('Should render Tooltip when areContactsVisible is false', () => {
    const hiddenContactsProps: MessageProps = {
      ...messageProps,
      settings: {
        ...messageProps.settings,
        areContactsVisible: false,
      },
    };

    render(<Message {...hiddenContactsProps} />);

    const tooltip = screen.queryAllByRole('tooltip');
    expect(tooltip.length).toBeGreaterThan(0);
  });
});
