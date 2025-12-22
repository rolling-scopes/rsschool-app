import { Alert, Typography } from 'antd';
import InfoCircleTwoTone from '@ant-design/icons/InfoCircleTwoTone';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { InterviewDto, TaskDtoTypeEnum } from '@client/api';
import { MentorOptionsContext } from './MentorPreferencesModal';
import { useAlert } from '../hooks/useAlert';
import styles from './RegistrationNoticeAlert.module.css';

export function RegistrationNoticeAlert(props: { interview: InterviewDto; startDate: string }) {
  const { startDate, interview } = props;
  const { showMentorOptions: openMentorOptions } = useContext(MentorOptionsContext);

  const [isDismissed, setDismissed] = useAlert(`registration-notice-alert-${interview.id}`);

  if (isDismissed) return null;

  if (interview.type !== TaskDtoTypeEnum.StageInterview) {
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
              Students’ registration for {interview.name} continues until {dayjs(startDate).format('DD MMM hh:mm')}. You
              can change <a onClick={showMentorOptions}>mentoring options</a> till this date.
            </Typography.Text>
            <div className={styles.iconMentor} />
          </>
        }
        type="info"
      />
    </>
  );

  function showMentorOptions(e: React.MouseEvent) {
    e.stopPropagation();
    openMentorOptions();
  }
}
