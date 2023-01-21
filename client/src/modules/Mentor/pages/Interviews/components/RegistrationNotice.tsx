import { Alert, Typography } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import moment from 'moment';
import { useContext } from 'react';
import { isInterviewRegistrationInProgess, stageInterviewType } from 'domain/interview';
import { InterviewDto } from 'api';
import { MentorOptionsContext } from './MentorPreferencesModal';

export function RegistrationNotice(props: { interview: InterviewDto; startDate: string }) {
  const { startDate, interview } = props;
  const { showMentorOptions: openMentorOptions } = useContext(MentorOptionsContext);

  if (interview.type !== stageInterviewType) {
    return null;
  }

  if (!isInterviewRegistrationInProgess(startDate)) {
    return null;
  }

  return (
    <>
      <Alert
        message="Registration period"
        icon={<InfoCircleTwoTone />}
        showIcon
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
