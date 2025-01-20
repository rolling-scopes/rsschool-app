import { formatShortDate } from 'services/formatter';

interface StudentInterviewDetails {
  registrationNotStarted: boolean;
  isRegistered: boolean;
  interviewPassed: boolean;
  registrationStart: string;
}

export const getInterviewCardDetails = ({
  interviewPassed,
  isRegistered,
  registrationNotStarted,
  registrationStart,
}: StudentInterviewDetails) => {
  if (interviewPassed) {
    return {
      cardMessage: 'You have your interview result. Congratulations!',
      backgroundImage: 'url(https://cdn.rs.school/sloths/cleaned/congratulations.svg)',
    };
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
