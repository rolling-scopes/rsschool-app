import { Alert, Typography } from 'antd';
import { InfoCircleTwoTone } from '@ant-design/icons';
import Link from 'next/link';
import { getInterviewWaitList } from 'domain/interview';

export function WaitListAlert({
  courseAlias,
  interviewId,
}: {
  courseAlias: string;
  interviewId: number;
  startDate: string;
}) {
  return (
    <div className="wait-list-alert">
      <Alert
        closable
        message="Do you want to interview more students?"
        icon={<InfoCircleTwoTone />}
        showIcon
        description={
          <>
            <Typography.Text onClick={e => e?.stopPropagation()}>
              Excellent candidates are waiting for their mentor. Please check the{' '}
              <Link href={getInterviewWaitList(courseAlias, interviewId)}>
                <a>students' waitlist. </a>
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
          height: 200px;
          margin: 10px auto;
        }
        .wait-list-alert {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
