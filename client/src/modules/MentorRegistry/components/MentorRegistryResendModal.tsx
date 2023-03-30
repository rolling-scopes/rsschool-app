import React from 'react';
import { Col, Modal, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { MentorRegistryDto } from 'api';

interface MentorRegistryModalProps {
  modalData: any;
  modalLoading?: boolean;
  resendConfirmation: (record: MentorRegistryDto) => void;
  onCancel: () => void;
}

export const MentorRegistryResendModal = (props: MentorRegistryModalProps) => {
  const { modalData, modalLoading, resendConfirmation, onCancel } = props;

  return (
    <Modal width={420} onOk={() => resendConfirmation(modalData.record)} open onCancel={onCancel} okText="Re-send">
      <Spin spinning={modalLoading ?? false}>
        <div style={{ display: 'flex' }}>
          <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#178df9', marginRight: 16 }} />
          <Col>
            <Typography.Title level={5}>Re-send Invitation for a Courses</Typography.Title>
            <Col>Do you want resend invitation for a not accepted courses?</Col>
          </Col>
        </div>
      </Spin>
    </Modal>
  );
};
