import { BranchesOutlined, CloseCircleTwoTone, SolutionOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Descriptions, Drawer, Popconfirm } from 'antd';
import { MentorBasic } from 'common/models';
import { CommentModal } from 'components/CommentModal';
import { MentorSearch } from 'components/MentorSearch';
import { useState } from 'react';
import { StudentDetails } from 'services/course';
import css from 'styled-jsx/css';

type Props = {
  details: StudentDetails | null;
  courseId: number;
  isLoading: boolean;
  onClose: () => void;
  onCreateRepository: () => void;
  onRestoreStudent: () => void;
  onExpelStudent: (comment: string) => void;
  onIssueCertificate: () => void;
  onUpdateMentor: (githubId: string) => void;
  courseManagerOrSupervisor: boolean;
};

export function DashboardDetails(props: Props) {
  const [expelMode, setExpelMode] = useState(false);
  const { details } = props;
  if (details == null) {
    return null;
  }
  return (
    <>
      <Drawer
        width={600}
        title={`${details.name} , ${details.githubId}`}
        placement="right"
        closable={false}
        onClose={props.onClose}
        open={!!details}
      >
        <div className="student-details-actions">
          {props.courseManagerOrSupervisor && (
            <>
              <Button
                disabled={!details.isActive || !!details.repository}
                icon={<BranchesOutlined />}
                onClick={props.onCreateRepository}
              >
                Create Repository
              </Button>
              <Popconfirm title="Are you sure you want to issue the certificate?" onConfirm={props.onIssueCertificate}>
                <Button disabled={!details.isActive} icon={<SolutionOutlined />} loading={props.isLoading}>
                  Issue Certificate
                </Button>
              </Popconfirm>
            </>
          )}
          <Button
            hidden={!details.isActive}
            icon={<CloseCircleTwoTone twoToneColor="red" />}
            onClick={() => setExpelMode(true)}
          >
            Expel
          </Button>
          <Button hidden={details.isActive} icon={<UndoOutlined />} onClick={props.onRestoreStudent}>
            Restore
          </Button>
          {props.courseManagerOrSupervisor && (
            <Descriptions bordered layout="vertical" size="small" column={1}>
              <Descriptions.Item label="Mentor">
                <MentorSearch
                  style={{ width: '100%' }}
                  onChange={props.onUpdateMentor}
                  courseId={props.courseId}
                  keyField="githubId"
                  value={(details.mentor as MentorBasic)?.githubId}
                  defaultValues={details.mentor ? [details.mentor as any] : []}
                />
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>
      </Drawer>
      <CommentModal
        title="Expelling Reason"
        visible={expelMode}
        onCancel={() => setExpelMode(false)}
        onOk={(text: string) => {
          props.onExpelStudent(text);
          setExpelMode(false);
        }}
      />
      <style jsx>{styles}</style>
    </>
  );
}

const styles = css`
  .student-details-actions :global(.ant-btn) {
    margin: 0 8px 8px 0;
  }
`;
