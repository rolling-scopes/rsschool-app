import {
  BranchesOutlined,
  CloseCircleTwoTone,
  FileExcelOutlined,
  SolutionOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Button, Descriptions, Drawer, Popconfirm, Modal, Input, InputRef } from 'antd';
import { MentorBasic } from 'common/models';
import { CommentModal } from 'components/CommentModal';
import { MentorSearch } from 'components/MentorSearch';
import { useRef, useState } from 'react';
import { StudentDetails } from 'services/course';
import css from 'styled-jsx/css';

type Props = {
  details: StudentDetails | null;
  courseId: number;
  isLoading: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onCreateRepository: () => void;
  onRestoreStudent: () => void;
  onExpelStudent: (comment: string) => void;
  onIssueCertificate: () => void;
  onRemoveCertificate: () => void;
  onUpdateMentor: (githubId: string) => void;
  courseManagerOrSupervisor: boolean;
};

export function DashboardDetails(props: Props) {
  const [expelMode, setExpelMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const modalInputRef = useRef<InputRef>(null);
  const { details } = props;
  if (details == null) {
    return null;
  }

  const handleModalConfirm = () => {
    if (inputValue === details.githubId) {
      props.onRemoveCertificate();
      setModalOpen(false);
      setInputValue('');
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setInputValue('');
  };

  const setModalInputFocus = (isOpen: boolean) => {
    if (isOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 0);
    }
  };

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
              {props.isAdmin && (
                <>
                  <Button
                    danger
                    icon={<FileExcelOutlined style={{ color: 'red' }} />}
                    onClick={() => setModalOpen(true)}
                    loading={props.isLoading}
                  >
                    Remove Certificate
                  </Button>
                  <Modal
                    title="Confirm and remove the certificate"
                    open={modalOpen}
                    onOk={handleModalConfirm}
                    onCancel={handleModalCancel}
                    afterOpenChange={setModalInputFocus}
                    width={350}
                    okButtonProps={{
                      disabled: inputValue !== details.githubId,
                      danger: true,
                    }}
                    okText="Confirm"
                    cancelText="Cancel"
                    destroyOnClose
                  >
                    <div style={{ padding: '8px 0' }}>
                      <p>
                        Type <strong>{details.githubId}</strong> to confirm:
                      </p>
                      <Input
                        ref={modalInputRef}
                        placeholder="GitHub username"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onPressEnter={handleModalConfirm}
                      />
                    </div>
                  </Modal>
                </>
              )}
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
