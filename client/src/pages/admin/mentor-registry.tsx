import { useCallback, useState, useMemo, useEffect } from 'react';
import { useAsync } from 'react-use';
import FileExcelOutlined from '@ant-design/icons/FileExcelOutlined';
import { Alert, Button, Col, Form, message, notification, Row, Select, Tabs, Typography } from 'antd';

import { DisciplineDto, DisciplinesApi, MentorRegistryDto } from 'api';

import { CoursesService } from 'services/courses';
import { MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';
import { ModalForm } from 'components/Forms';
import { MentorRegistryResendModal } from 'modules/MentorRegistry/components/MentorRegistryResendModal';
import { MentorRegistryDeleteModal } from 'modules/MentorRegistry/components/MentorRegistryDeleteModal';
import { MentorRegistryTable } from 'modules/MentorRegistry/components/MentorRegistryTable';
import { MentorRegistryTableContainer } from 'modules/MentorRegistry/components/MentorRegistryTableContainer';
import { MentorRegistryTabsMode } from 'modules/MentorRegistry/constants';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { useLoading } from 'components/useLoading';
import { Session, withSession } from 'components/withSession';
import { AdminPageLayout } from 'components/PageLayout';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import css from 'styled-jsx/css';
import { CommentModal } from 'components/CommentModal';

type Props = {
  courses: Course[];
  session: Session;
};

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export enum ModalDataMode {
  Invite = 'invite',
  Resend = 'resend',
  Delete = 'delete',
  Comment = 'comment',
}

type ModalData = Partial<{
  record: MentorRegistryDto;
  mode: ModalDataMode;
}>;

const mentorRegistryService = new MentorRegistryService();
const coursesService = new CoursesService();
const disciplinesApi = new DisciplinesApi();

function Page(props: Props) {
  const [loading, withLoading] = useLoading(false);

  const [api, contextHolder] = notification.useNotification();

  const [modalLoading, setModalLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [data, setData] = useState<MentorRegistryDto[]>([]);
  const [allData, setAllData] = useState<MentorRegistryDto[]>([]);
  const [maxStudents, setMaxStudents] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [activeTab, setActiveTab] = useState<MentorRegistryTabsMode>(MentorRegistryTabsMode.New);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const updateData = (showAll: boolean, allData: MentorRegistryDto[]) => {
    setShowAll(showAll);
    const data = filterData(allData, showAll);
    setData(data);
    setMaxStudents(data.reduce((sum, it) => sum + it.maxStudentsLimit, 0));
  };

  const loadData = withLoading(async () => {
    const [allData, courses] = await Promise.all([mentorRegistryService.getMentors(), coursesService.getCourses()]);
    const { data: disciplines } = await disciplinesApi.getDisciplines();
    setAllData(allData);
    updateData(showAll, allData);
    setCourses(courses);
    setDisciplines(disciplines);
  });

  const cancelMentor = withLoading(async (githubId: string) => {
    setModalData(null);
    await mentorRegistryService.cancelMentorRegistry(githubId);
    await loadData();
    setIsModalOpen(false);
  });

  const sendMentorRegistryComment = withLoading(async (comment: string) => {
    if (!modalData?.record?.githubId) return;
    try {
      await mentorRegistryService.sendCommentMentorRegistry(modalData?.record?.githubId, comment);
      await loadData();
    } catch (error) {
      message.error('An error occurred. Please try again later.');
    } finally {
      setIsModalOpen(false);
    }
  });

  useAsync(loadData, []);

  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: 'Success',
      description: 'Your invitation was successfully send',
    });
  };

  const handleModalSubmit = useCallback(
    async (values: any) => {
      try {
        setModalLoading(true);
        modalData?.record?.githubId && (await mentorRegistryService.updateMentor(modalData.record.githubId, values));
        setModalData(null);
        await loadData();
        openNotificationWithIcon('success');
      } catch (e) {
        message.error('An error occurred. Please try again later.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalData, openNotificationWithIcon, loadData],
  );

  const renderModal = useCallback(() => {
    return (
      <ModalForm
        data={modalData?.record}
        title="Record"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        getInitialValues={getInitialValues}
        loading={modalLoading}
      >
        <Form.Item name="preselectedCourses" label="Pre-Selected Courses">
          <Select mode="multiple" optionFilterProp="children">
            {courses.map(course => (
              <Select.Option disabled={course.completed} key={course.id} value={course.id}>
                {course.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </ModalForm>
    );
  }, [modalData]);

  const getInitialValues = useCallback((record?: Partial<any>) => {
    return {
      preselectedCourses: record?.preselectedCourses?.map((v: string) => Number(v)),
    };
  }, []);

  async function resendConfirmation(record: MentorRegistryDto) {
    try {
      setModalLoading(true);
      setModalData(null);
      await mentorRegistryService.updateMentor(record!.githubId, getInitialValues(record));
      loadData();
    } catch (e) {
      message.error('An error occurred. Please try again later.');
    } finally {
      setModalLoading(false);
      setModalData(null);
    }
  }

  const tabs = useMemo(() => {
    const tabs = [
      { key: MentorRegistryTabsMode.New, label: 'New applications', count: filterData(allData, false).length },
      { key: MentorRegistryTabsMode.All, label: 'All Mentors', count: allData.length },
    ];
    return tabs.map(el => tabRenderer(el, activeTab));
  }, [activeTab, allData]);

  useEffect(() => {
    activeTab === MentorRegistryTabsMode.New ? updateData(false, allData) : updateData(true, allData);
  }, [activeTab, allData]);

  const handleTabChange = useCallback(() => {
    activeTab === MentorRegistryTabsMode.New
      ? setActiveTab(MentorRegistryTabsMode.All)
      : setActiveTab(MentorRegistryTabsMode.New);
  }, [activeTab]);

  const handleModalDataChange = (mode: ModalDataMode, record: MentorRegistryDto) => {
    setIsModalOpen(true);
    setModalData({ mode, record });
  };

  const onCancelModal = () => {
    setModalData(null);
    setIsModalOpen(false);
  };

  return (
    <AdminPageLayout
      session={props.session}
      title="Mentor Registry"
      loading={loading}
      courses={courses}
      styles={{ margin: 0, padding: 0 }}
    >
      <Row justify="space-between" style={{ padding: '0 24px', minHeight: 64 }} align="bottom" className="tabs">
        <Tabs tabBarStyle={{ margin: '0' }} activeKey={activeTab} items={tabs} onChange={handleTabChange} />
        <Button
          icon={<FileExcelOutlined />}
          style={{ alignSelf: 'center' }}
          onClick={() => (window.location.href = `/api/registry/mentors/csv`)}
        >
          Export CSV
        </Button>
        <style jsx>{styles}</style>
      </Row>
      <Col style={{ background: '#f0f2f5', padding: 24 }}>
        <Alert
          message={
            <>
              The number of mentors below can mentor: <Typography.Text strong>{maxStudents} students</Typography.Text>
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <MentorRegistryTableContainer
          mentors={data}
          courses={courses}
          activeTab={activeTab}
          disciplines={disciplines}
          handleModalDataChange={handleModalDataChange}
        >
          {mentorRegistryProps => <MentorRegistryTable {...mentorRegistryProps} />}
        </MentorRegistryTableContainer>
      </Col>
      {isModalOpen && modalData?.mode === ModalDataMode.Invite && renderModal()}
      {isModalOpen && modalData?.mode === ModalDataMode.Resend && (
        <MentorRegistryResendModal
          modalData={modalData || {}}
          modalLoading={modalLoading}
          resendConfirmation={resendConfirmation}
          onCancel={onCancelModal}
        />
      )}
      {isModalOpen && modalData?.mode === ModalDataMode.Delete && (
        <MentorRegistryDeleteModal
          modalData={modalData || {}}
          modalLoading={modalLoading}
          onCancel={onCancelModal}
          cancelMentor={cancelMentor}
        />
      )}
      {isModalOpen && modalData?.mode === ModalDataMode.Comment && (
        <CommentModal
          title="Comment"
          visible={isModalOpen}
          onCancel={onCancelModal}
          initialValue={modalData?.record?.comment ?? undefined}
          availableEmptyComment={true}
          onOk={(comment: string) => {
            sendMentorRegistryComment(comment);
          }}
        />
      )}
      {contextHolder}
    </AdminPageLayout>
  );
}

function filterData(data: MentorRegistryDto[], showAll: boolean) {
  if (showAll) {
    return data;
  }
  return data.filter(
    it =>
      it.courses.length === 0 ||
      !it.preselectedCourses.length ||
      !it.preselectedCourses.every(c => it.courses.includes(c)),
  );
}

export { getServerSideProps };

export default withSession(Page, { onlyForAnyCoursePowerUser: true });

export const styles = css`
  @media (min-width: 575px) {
    .tabs {
      padding: '12px 24px 0';
      height: 64px;
    }
  }
`;
