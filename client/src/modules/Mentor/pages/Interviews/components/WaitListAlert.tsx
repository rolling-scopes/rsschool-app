import { Alert, theme, Typography } from 'antd';
import InfoCircleTwoTone from '@ant-design/icons/InfoCircleTwoTone';
import Link from 'next/link';
import { getInterviewWaitList } from 'domain/interview';
import { useAlert } from '../hooks/useAlert';

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
    <div className="wait-list-alert">
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
            <div className="icon-group" />
          </>
        }
        type="info"
      />
      <style jsx>{`
        .icon-group {
          background-image: url(/static/svg/sloths/students.svg);
          background-position: center;
          background-size: contain;
          background-repeat: no-repeat;
          width: 270px;
          height: 160px;
          margin: 10px auto;
        }
        .wait-list-alert {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
