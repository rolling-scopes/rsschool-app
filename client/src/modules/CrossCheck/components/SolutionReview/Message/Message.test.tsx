import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Message, { MessageProps } from './Message';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';

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
});
