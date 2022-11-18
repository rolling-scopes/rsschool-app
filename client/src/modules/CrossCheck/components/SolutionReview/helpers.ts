import { CrossCheckMessageAuthorRole, TaskSolutionResultMessage } from 'services/course';

export function getAmountUnreadMessages(
  currentRole: CrossCheckMessageAuthorRole,
  messages: TaskSolutionResultMessage[],
): number {
  switch (currentRole) {
    case CrossCheckMessageAuthorRole.Reviewer:
      return messages.filter(messages => !messages.isReviewerRead).length;

    case CrossCheckMessageAuthorRole.Student:
      return messages.filter(messages => !messages.isStudentRead).length;

    default:
      return 0;
  }
}

export function getHowManyUnreadMessagesText(amountUnreadMessages: number) {
  return `You have ${amountUnreadMessages} unread ${amountUnreadMessages > 1 ? 'messages' : 'message'}`;
}
