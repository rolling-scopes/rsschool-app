import { InterviewResult } from 'domain/interview';
import { formatShortDate } from 'services/formatter';

interface StudentInterviewDetails {
  registrationNotStarted: boolean;
  isRegistered: boolean;
  interviewPassed: boolean;
  registrationStart: string;
  interviewResult: InterviewResult;
}

export const getInterviewCardDetails = ({
  interviewResult,
  interviewPassed,
  isRegistered,
  registrationNotStarted,
  registrationStart,
}: StudentInterviewDetails) => {
  if (interviewPassed) {
    switch (interviewResult) {
      case InterviewResult.Yes:
        return {
          cardMessage: 'You have your interview result. Congratulations!',
          backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/congratulations.svg)',
        };
      case InterviewResult.No:
        return {
          cardMessage: 'Your interview result is ready. Mistakes are proof that you are trying. Stay positive!',
          backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/train.svg)',
        };
      case InterviewResult.Draft:
        return {
          cardMessage: `Your interview is complete. The mentor hasn’t provided feedback yet. Please check back later.`,
          backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/mentor-new.svg)',
        };
    }
  }

  if (isRegistered) {
    return {
      cardMessage: 'You’re all set! Prepare for your upcoming interview.',
      backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/its-a-good-job.svg)',
    };
  }

  if (registrationNotStarted) {
    return {
      cardMessage: (
        <div>
          Remember to come back and register after{' '}
          <span style={{ whiteSpace: 'nowrap' }}>{formatShortDate(registrationStart ?? '')}</span>!
        </div>
      ),
      backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/listening.svg)',
    };
  }

  return {
    cardMessage: 'Register and get ready for your exciting interview!',
    backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/take-notes.svg)',
  };
};
