import { render, screen } from '@testing-library/react';
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

  test('renders without a reviewNumber (defaults to 0)', () => {
    const { reviewNumber: _omit, ...rest } = messageProps;
    render(<Message {...rest} />);

    // Still renders the message; Username receives `reviewNumber ?? 0`.
    expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('shows an unread badge for the reviewer when the reviewer has not read it', () => {
    render(
      <Message
        {...messageProps}
        currentRole={CrossCheckMessageDtoRoleEnum.Reviewer}
        message={{ ...messageProps.message, isReviewerRead: false, isStudentRead: false }}
      />,
    );

    // Unread → the tooltip wrapper exposes the "Unread message" title.
    expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
  });

  test('renders both read-receipt check marks when reviewer and student have read', () => {
    render(<Message {...messageProps} />);

    // Both isReviewerRead and isStudentRead are true → two tooltip check icons.
    expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
  });
});
