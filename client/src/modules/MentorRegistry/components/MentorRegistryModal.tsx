import { Col, Form, Modal, Select, Spin, Typography } from 'antd';
import React, { useCallback } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Course } from 'services/models';
import { MentorRegistryDto } from 'api';

interface MentorRegistryModalProps {
  modalData: any;
  modalLoading?: boolean;
  courses: Course[];
  handleModalSubmit: (arg: any) => void;
  getInitialValues: (arg: MentorRegistryDto) => any;
  resendConfirmation: (record: MentorRegistryDto) => void;
  onCancel: () => void;
  cancelMentor: (githubId: string) => Promise<void | undefined>;
}

export const MentorRegistryModal = (props: MentorRegistryModalProps) => {
  const {
    modalData,
    modalLoading,
    courses,
    handleModalSubmit,
    getInitialValues,
    resendConfirmation,
    onCancel,
    cancelMentor,
  } = props;
  const [form] = Form.useForm();

  const renderModal = useCallback(() => {
    switch (modalData?.mode) {
      case 'invite':
        return (
          <Modal
            style={{ top: 20 }}
            width={700}
            open
            title="Invite Mentor for a Courses"
            okText="Send Invite"
            onOk={async e => {
              e.preventDefault();
              const values = await form.validateFields().catch(() => null);
              if (values == null) {
                return;
              }
              handleModalSubmit(values);
            }}
            onCancel={() => {
              onCancel();
              form.resetFields();
            }}
          >
            <Spin spinning={modalLoading ?? false}>
              <Form layout="vertical" form={form} initialValues={getInitialValues(modalData.record)}>
                <Form.Item name="preselectedCourses" label="Pre-Selected Courses" required>
                  <Select mode="multiple" optionFilterProp="children">
                    {courses.map(course => (
                      <Select.Option disabled={course.completed} key={course.id} value={course.id}>
                        {course.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
        );
      case 're-send':
        return (
          <Modal
            width={420}
            onOk={() => resendConfirmation(modalData.record)}
            open
            onCancel={onCancel}
            okText="Re-send"
          >
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
      case 'delete':
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
      default:
        return null;
    }
  }, [modalData]);

  return renderModal();
};
