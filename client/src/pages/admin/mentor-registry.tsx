import FileExcelOutlined from '@ant-design/icons/FileExcelOutlined';
import { Alert, Button, Col, Form, message, notification, Row, Select, Space, Tabs, Tooltip, Typography } from 'antd';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import { DisciplineDto, DisciplinesApi, MentorRegistryDto } from 'api';

import { CommentModal } from 'components/CommentModal';
import { ModalForm } from 'components/Forms';
import { AdminPageLayout } from 'components/PageLayout';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import { useLoading } from 'components/useLoading';
import { ActiveCourseProvider, SessionContext, SessionProvider } from 'modules/Course/contexts';
import {
  CombinedFilter,
  MentorRegistryDeleteModal,
  MentorRegistryResendModal,
  MentorRegistryTable,
  MentorRegistryTableContainer,
  MentorRegistryTabsMode,
  PAGINATION,
} from 'modules/MentorRegistry';
import dynamic from 'next/dynamic';
import { CoursesService } from 'services/courses';
import { MentorRegistryService } from 'services/mentorRegistry';
import { Course, CourseRole } from 'services/models';
import css from 'styled-jsx/css';

const InviteMentorsModal = dynamic(() => import('modules/MentorRegistry/components/InviteMentorsModal'), {
  ssr: false,
});

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export enum ModalDataMode {
  Invite = 'invite',
  Resend = 'resend',
  Delete = 'delete',
  Comment = 'comment',
  BatchInvite = 'batchInvite',
}

type ModalData = Partial<{
  record: MentorRegistryDto;
  mode: ModalDataMode;
}>;

type FormData = {
  preselectedCourses: number[];
};

const mentorRegistryService = new MentorRegistryService();
const coursesService = new CoursesService();
const disciplinesApi = new DisciplinesApi();

function Page() {
  const [loading, withLoading] = useLoading(false);
  const session = useContext(SessionContext);

  const [api, contextHolder] = notification.useNotification();

  const [courses, setCourses] = useState<Course[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [data, setData] = useState<MentorRegistryDto[]>([]);
  const [allData, setAllData] = useState<MentorRegistryDto[]>([]);
  const [maxStudents, setMaxStudents] = useState(0);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [activeTab, setActiveTab] = useState<MentorRegistryTabsMode>(MentorRegistryTabsMode.New);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [combinedFilter, setCombinedFilter] = useState<CombinedFilter>({
    preferredCourses: [],
    preselectedCourses: [],
    technicalMentoring: [],
    githubId: [],
    cityName: [],
    status: MentorRegistryTabsMode.New,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState({
    [MentorRegistryTabsMode.New]: 0,
    [MentorRegistryTabsMode.All]: 0,
  });

  const loadData = withLoading(async () => {
    const [allData, courses] = await Promise.all([
      mentorRegistryService.getMentors({
        status: activeTab,
        pageSize: PAGINATION,
        currentPage,
        githubId: combinedFilter.githubId?.[0] ?? undefined,
        cityName: combinedFilter.cityName?.[0] ?? undefined,
        preferedCourses: combinedFilter.preferredCourses?.length
          ? combinedFilter.preferredCourses.map(Number)
          : undefined,
        preselectedCourses: combinedFilter.preselectedCourses?.length
          ? combinedFilter.preselectedCourses.map(Number)
          : undefined,
        technicalMentoring: combinedFilter.technicalMentoring?.length ? combinedFilter.technicalMentoring : undefined,
      }),
      coursesService.getCourses(),
    ]);
    const { data: disciplines } = await disciplinesApi.getDisciplines();
    setAllData(allData.mentors);
    setData(allData.mentors);
    setTotal(total => ({ ...total, [activeTab]: allData.total }));
    setMaxStudents(allData.mentors.reduce((sum, it) => sum + it.maxStudentsLimit, 0));
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
    } catch {
      message.error('An error occurred. Please try again later.');
    } finally {
      setIsModalOpen(false);
    }
  });

  useAsync(loadData, [combinedFilter, currentPage, activeTab]);

  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      message: 'Success',
      description: 'Your invitation was successfully send',
    });
  };

  const handleModalSubmit = useCallback(
    async (values: FormData) => {
      const originalSortedData = modalData?.record?.preselectedCourses.map(courseId => String(courseId)).sort();
      const updatedPreselectedCourses = values.preselectedCourses.map(courseId => String(courseId));
      const updatedSortedData = updatedPreselectedCourses.sort();

      const isSame = JSON.stringify(originalSortedData) === JSON.stringify(updatedSortedData);

      if (isSame) {
        setModalData(null);
        return;
      }

      try {
        setModalLoading(true);
        if (modalData?.record?.githubId) {
          await mentorRegistryService.updateMentor(modalData.record.githubId, {
            preselectedCourses: updatedPreselectedCourses,
          });
        }
        setModalData(null);
        await loadData();
        openNotificationWithIcon('success');
      } catch {
        message.error('An error occurred. Please try again later.');
      } finally {
        setModalLoading(false);
      }
    },
    [modalData, openNotificationWithIcon, loadData],
  );

  const renderModal = useCallback(() => {
    const data = modalData?.record;
    if (!data) {
      return null;
    }

    const allShownCourses = courses.filter(course => {
      const isCompletedAndPreselected = course.completed && data.preselectedCourses.includes(course.id);
      const isActiveWithPersonalMentoring = !course.completed && course.personalMentoring;
      return isCompletedAndPreselected || isActiveWithPersonalMentoring;
    });

    return (
      <ModalForm
        data={data}
        title="Record"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
        loading={modalLoading}
      >
        <Form.Item name="preselectedCourses" label="Pre-Selected Courses">
          <Select mode="multiple" optionFilterProp="children">
            {allShownCourses.map(course => (
              <Select.Option key={course.id} value={course.id}>
                {course.completed ? (
                  <Tooltip title="Completed course">
                    <span style={{ color: 'red' }}>{course.name}</span>
                  </Tooltip>
                ) : (
                  course.name
                )}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </ModalForm>
    );
  }, [modalData]);

  async function resendConfirmation(record: MentorRegistryDto) {
    try {
      setModalLoading(true);
      setModalData(null);
      await mentorRegistryService.updateMentor(record!.githubId, {
        preselectedCourses: record.preselectedCourses.map(v => String(v)),
      });
      loadData();
    } catch {
      message.error('An error occurred. Please try again later.');
    } finally {
      setModalLoading(false);
      setModalData(null);
    }
  }

  const tabs = useMemo(() => {
    const tabs = [
      { key: MentorRegistryTabsMode.New, label: 'New applications', count: Number(total[MentorRegistryTabsMode.New]) },
      { key: MentorRegistryTabsMode.All, label: 'All Mentors', count: Number(total[MentorRegistryTabsMode.All]) },
    ];
    return tabs.map(el => tabRenderer(el, activeTab));
  }, [activeTab, allData]);

  const handleTabChange = useCallback(() => {
    if (activeTab === MentorRegistryTabsMode.New) {
      setActiveTab(MentorRegistryTabsMode.All);
      setAllData([]);
      setData([]);
      setCurrentPage(1);
    } else {
      setActiveTab(MentorRegistryTabsMode.New);
      setAllData([]);
      setData([]);
      setCurrentPage(1);
    }
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
    <AdminPageLayout title="Mentor Registry" loading={loading} courses={courses} styles={{ margin: 0, padding: 0 }}>
      <Row justify="space-between" style={{ padding: '0 24px', minHeight: 64 }} align="bottom" className="tabs">
        <Tabs tabBarStyle={{ margin: '0' }} activeKey={activeTab} items={tabs} onChange={handleTabChange} />
        <Space style={{ alignSelf: 'center' }}>
          <Button icon={<FileExcelOutlined />} onClick={() => (window.location.href = `/api/registry/mentors/csv`)}>
            Export CSV
          </Button>
          {session.isAdmin && (
            <Button type="primary" onClick={() => setModalData({ mode: ModalDataMode.BatchInvite })}>
              Invite mentors
            </Button>
          )}
        </Space>
        <style jsx>{styles}</style>
      </Row>
      <Col style={{ padding: 24 }}>
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
          tagFilters={tagFilters}
          setTagFilters={setTagFilters}
          combinedFilter={combinedFilter}
          setCombinedFilter={setCombinedFilter}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          total={total}
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
      {modalData?.mode === ModalDataMode.BatchInvite && <InviteMentorsModal onCancel={onCancelModal} />}
      {contextHolder}
    </AdminPageLayout>
  );
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor]} anyCoursePowerUser>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export const styles = css`
  @media (min-width: 575px) {
    .tabs {
      padding: '12px 24px 0';
      height: 64px;
    }
  }
`;
