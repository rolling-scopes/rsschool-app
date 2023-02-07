import { Alert, Typography } from 'antd';
import InfoCircleTwoTone from '@ant-design/icons/InfoCircleTwoTone';
import moment from 'moment';
import { useContext } from 'react';
import { stageInterviewType } from 'domain/interview';
import { InterviewDto } from 'api';
import { MentorOptionsContext } from './MentorPreferencesModal';
import { useAlert } from '../hooks/useAlert';

export function RegistrationNoticeAlert(props: { interview: InterviewDto; startDate: string }) {
  const { startDate, interview } = props;
  const { showMentorOptions: openMentorOptions } = useContext(MentorOptionsContext);

  const [isDismissed, setDismissed] = useAlert(`registration-notice-alert-${interview.id}`);

  if (isDismissed) return null;

  if (interview.type !== stageInterviewType) {
    return null;
  }

  return (
    <>
      <Alert
        closable
        message="Registration period"
        icon={<InfoCircleTwoTone />}
        showIcon
        onClose={() => setDismissed()}
        description={
          <>
            <Typography.Text>
              Students’ registration for {interview.name} continues until {moment(startDate).format('DD MMM hh:mm')}.
              You can change <a onClick={showMentorOptions}>mentoring options</a> till this date.
            </Typography.Text>
            <div className="icon-mentor" />
          </>
        }
        type="info"
      />
      <style jsx>{`
        .icon-mentor {
          background-image: url(https://cdn.rs.school/sloths/cleaned/mentor-new.svg);
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat;
          width: 129px;
          height: 170px;
          margin: 10px auto;
        }
      `}</style>
    </>
  );

  function showMentorOptions(e: React.MouseEvent) {
    e.stopPropagation();
    openMentorOptions();
  }
}
