import { CrossCheckMessageAuthorRole, CrossCheckMessage } from 'services/course';

export const getAmountUnreadMessages = (
  currentRole: CrossCheckMessageAuthorRole,
  messages: CrossCheckMessage[],
): number => {
  switch (currentRole) {
    case CrossCheckMessageAuthorRole.Reviewer:
      return messages.filter(messages => !messages.isReviewerRead).length;

    case CrossCheckMessageAuthorRole.Student:
      return messages.filter(messages => !messages.isStudentRead).length;

    default:
      return 0;
  }
};

export const getHowManyUnreadMessagesText = (amountUnreadMessages: number): string => {
  return `You have ${amountUnreadMessages} unread ${amountUnreadMessages > 1 ? 'messages' : 'message'}`;
};
