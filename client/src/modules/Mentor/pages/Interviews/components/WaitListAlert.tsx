import { Alert, theme, Typography } from 'antd';
import InfoCircleTwoTone from '@ant-design/icons/InfoCircleTwoTone';
import Link from 'next/link';
import { getInterviewWaitList } from 'domain/interview';
import { useAlert } from '../hooks/useAlert';
import styles from './WaitListAlert.module.css';

export function WaitListAlert({
  courseAlias,
  interviewId,
}: {
  courseAlias: string;
  interviewId: number;
  startDate: string;
}) {
  const { token } = theme.useToken();
  const [isDismissed, setDismissed] = useAlert(`waitlist-alert-${interviewId}`);

  if (isDismissed) return null;

  return (
    <div className={styles.waitListAlert}>
      <Alert
        closable
        message="Do you want to interview more students?"
        icon={<InfoCircleTwoTone />}
        onClose={() => setDismissed()}
        showIcon
        description={
          <>
            <Typography.Text onClick={e => e?.stopPropagation()}>
              Excellent candidates are waiting for their mentor. Please check the{' '}
              <Link
                style={{ fontWeight: 'bold', color: token.blue7, letterSpacing: '0.1ch' }}
                href={getInterviewWaitList(courseAlias, interviewId)}
              >
                students' waitlist.
              </Link>
            </Typography.Text>
            <div className={styles.iconGroup} />
          </>
        }
        type="info"
      />
    </div>
  );
}
