import React from 'react';
import { Col, Modal, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface MentorRegistryModalProps {
  modalData: any;
  modalLoading?: boolean;
  onCancel: () => void;
  cancelMentor: (githubId: string) => Promise<void>;
}

export const MentorRegistryDeleteModal = (props: MentorRegistryModalProps) => {
  const { modalData, modalLoading, cancelMentor, onCancel } = props;

  return (
    <Modal
      width={420}
      onOk={() => cancelMentor(modalData.record.githubId)}
      open
      onCancel={onCancel}
      okText="Delete"
      okButtonProps={{ danger: true, type: 'primary' }}
    >
      <Spin spinning={modalLoading ?? false}>
        <div style={{ display: 'flex' }}>
          <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#faad14', marginRight: 16 }} />
          <Col>
            <Typography.Title level={5}>Are you sure to delete this Mentor apply?</Typography.Title>
            <Col>If you delete mentor's apply you can't restore it.</Col>
          </Col>
        </div>
      </Spin>
    </Modal>
  );
};
