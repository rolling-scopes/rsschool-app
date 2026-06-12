import {
  BranchesOutlined,
  CloseCircleOutlined,
  FileExcelOutlined,
  SolutionOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Button, Descriptions, Drawer, Popconfirm, theme } from 'antd';
import { MentorBasic } from '@common/models';
import { CommentModal } from '@client/shared/components/CommentModal';
import { MentorSearch } from '@client/shared/components/MentorSearch';
import { IssueCertificateModal } from '@client/modules/CourseManagement/components';
import { useState } from 'react';
import { StudentDetails } from '@client/services/course';
import styles from './DashboardDetails.module.css';

type Props = {
  details: StudentDetails | null;
  courseId: number;
  isLoading: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onCreateRepository: () => void;
  onRestoreStudent: () => void;
  onExpelStudent: (comment: string) => void;
  onIssueCertificate: (templateId: string) => void;
  onRemoveCertificate: () => void;
  onUpdateMentor: (githubId: string) => void;
  courseManagerOrSupervisor: boolean;
};

export function DashboardDetails(props: Props) {
  const [expelMode, setExpelMode] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const { details } = props;
  const { token } = theme.useToken();
  if (details == null) {
    return null;
  }

  return (
    <>
      <Drawer
        width={props.isAdmin ? 660 : 600}
        title={`${details.name} , ${details.githubId}`}
        placement="right"
        closable={false}
        onClose={props.onClose}
        open={!!details}
      >
        <div className={styles.studentDetailsActions}>
          {props.courseManagerOrSupervisor && (
            <>
              <Button
                disabled={!details.isActive || !!details.repository}
                icon={<BranchesOutlined />}
                onClick={props.onCreateRepository}
              >
                Create Repository
              </Button>
              <Button
                disabled={!details.isActive}
                icon={<SolutionOutlined />}
                loading={props.isLoading}
                onClick={() => setIssueOpen(true)}
              >
                Issue Certificate
              </Button>
              {props.isAdmin && (
                <Popconfirm
                  title="Are you sure you want to remove the certificate?"
                  onConfirm={props.onRemoveCertificate}
                >
                  <Button
                    danger
                    icon={<FileExcelOutlined style={{ color: token.colorError }} />}
                    loading={props.isLoading}
                  >
                    Remove Certificate
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
          <Button
            danger
            hidden={!details.isActive}
            icon={<CloseCircleOutlined style={{ color: token.colorError }} />}
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
                  disabled={!details.isActive}
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
        <IssueCertificateModal
          open={issueOpen}
          studentName={details.name}
          onCancel={() => setIssueOpen(false)}
          onSubmit={templateId => {
            props.onIssueCertificate(templateId);
            setIssueOpen(false);
          }}
        />
      </Drawer>
      <CommentModal
        title="Expelling Reason"
        open={expelMode}
        onCancel={() => setExpelMode(false)}
        onOk={(text: string) => {
          props.onExpelStudent(text);
          setExpelMode(false);
        }}
      />
    </>
  );
}
