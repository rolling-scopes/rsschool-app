import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Table } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { ColumnsType } from 'antd/lib/table';
import { CoursesTasksApi, CourseTaskDto, CrossCheckStatusEnum } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import { AdminPageLayout } from 'components/PageLayout';
import {
  crossCheckDateRenderer,
  crossCheckStatusRenderer,
  dateRenderer,
  getColumnSearchProps,
  stringSorter,
} from 'components/Table';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { CourseTaskModal } from 'modules/CourseManagement/components/CourseTaskModal';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CourseRole } from 'services/models';
import { useMessage } from 'hooks';

const courseTasksApi = new CoursesTasksApi();

function Page() {
  const { message } = useMessage();
  const { course, courses } = useActiveCourseContext();
  const courseId = course.id;
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as CourseTaskDto[]);
  const [modalData, setModalData] = useState<Partial<CourseTaskDto> | null>(null);
  const [modalAction, setModalAction] = useState('update');

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await courseTasksApi.getCourseTasksDetailed(courseId);
    setData(data);
    setLoading(false);
  }, [courseId]);

  useAsync(loadData, [courseId]);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: CourseTaskDto) => {
    setModalData(record);
    setModalAction('update');
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const result = confirm('Are you sure you want to delete this item?');
      if (!result) {
        return;
      }
      await courseTasksApi.deleteCourseTask(course.id, id);
      await loadData();
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const handleModalSubmit = async (record: any) => {
    if (modalAction === 'update') {
      await courseTasksApi.updateCourseTask(course.id, modalData!.id!, record);
    } else {
      const { ...rest } = record;
      await courseTasksApi.createCourseTask(course.id, rest);
    }
    await loadData();

    setModalData(null);
  };

  const handleTaskDistribute = async (record: CourseTaskDto) => {
    setLoading(true);
    await service.createTaskDistribution(record.id);
    setLoading(false);
  };

  const handleInterviewDistribute = async (record: CourseTaskDto) => {
    setLoading(true);
    await service.createInterviewDistribution(record.id);
    setLoading(false);
  };

  const getDropdownMenu = (record: CourseTaskDto) => {
    const hasInterviewDistibute = record.type === 'interview';
    const hasTaskDistibute = record.checker === 'assigned';
    const hasCrossCheck = record.checker === 'crossCheck';

    const currentTimestamp = Date.now();
    const submitDeadlineTimestamp = new Date(record.studentEndDate).getTime();
    const isSubmitDeadlinePassed = currentTimestamp > submitDeadlineTimestamp;

    const items = [
      {
        key: 'edit',
        label: 'Edit',
        onClick: () => handleEditItem(record),
      },
      {
        key: 'delete',
        label: 'Delete',
        onClick: () => handleDeleteItem(record.id),
      },
      hasTaskDistibute
        ? {
            key: 'distribute',
            label: 'Distribute',
            onClick: () => handleTaskDistribute(record),
          }
        : null,
      hasInterviewDistibute
        ? {
            key: 'interviewDistribute',
            label: 'Distribute',
            onClick: () => handleInterviewDistribute(record),
          }
        : null,
      hasCrossCheck
        ? {
            type: 'divider',
          }
        : null,
      hasCrossCheck
        ? {
            key: 'crossCheckDistribute',
            label: 'Cross-Check: Distribute',
            disabled: !isSubmitDeadlinePassed,
            onClick: () => handleCrossCheckDistribution(record),
          }
        : null,
      hasCrossCheck
        ? {
            key: 'crossCheckComplete',
            label: 'Cross-Check: Complete',
            disabled: !isSubmitDeadlinePassed || record.crossCheckStatus === CrossCheckStatusEnum.Initial,
            onClick: () => handleCrossCheckCompletion(record),
          }
        : null,
    ].filter(Boolean) as ItemType[];

    return (
      <Dropdown trigger={['click']} menu={{ items }}>
        <Button size="small">
          More <MoreOutlined />
        </Button>
      </Dropdown>
    );
  };

  const handleCrossCheckDistribution = async (record: CourseTaskDto) => {
    try {
      const {
        data: { crossCheckPairs },
      } = await service.createCrossCheckDistribution(record.id);
      if (crossCheckPairs.length) {
        message.success('Cross-Check distrubtion has been created');
      } else {
        message.warning('Cross-check pairs were not created because there are no submitted solutions');
      }
    } catch {
      message.error('An error occurred.');
    } finally {
      await loadData();
    }
  };

  const handleCrossCheckCompletion = async (record: CourseTaskDto) => {
    try {
      await service.createCrossCheckCompletion(record.id);

      message.success('Cross-Check completed has been created');
    } catch {
      message.error('An error occurred.');
    } finally {
      await loadData();
    }
  };

  return (
    <AdminPageLayout loading={loading} courses={courses}>
      <Button type="primary" onClick={handleAddItem}>
        Add Task
      </Button>
      <Table
        style={{ marginTop: 16 }}
        rowKey="id"
        pagination={false}
        size="small"
        dataSource={data}
        columns={getColumns(getDropdownMenu)}
        scroll={{ x: 1020, y: 'calc(100vh - 265px)' }}
      />
      {modalData ? (
        <CourseTaskModal onCancel={() => setModalData(null)} onSubmit={handleModalSubmit} data={modalData} />
      ) : null}
    </AdminPageLayout>
  );
}

function getColumns(getDropdownMenu: (record: CourseTaskDto) => any): ColumnsType<CourseTaskDto> {
  return [
    { title: 'Id', dataIndex: 'id', fixed: 'left' },
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
      ...getColumnSearchProps('name'),
    },
    { title: 'Scores Count', dataIndex: 'resultsCount' },
    {
      title: 'Start Date',
      dataIndex: 'studentStartDate',
      render: dateRenderer,
      sorter: stringSorter('studentStartDate'),
    },
    { title: 'End Date', dataIndex: 'studentEndDate', render: dateRenderer, sorter: stringSorter('studentEndDate') },
    {
      title: 'Cross-Check End Date',
      dataIndex: 'crossCheckEndDate',
      render: crossCheckDateRenderer,
      sorter: stringSorter('crossCheckEndDate'),
    },
    {
      title: 'Cross-Check Status',
      dataIndex: 'crossCheckStatus',
      render: crossCheckStatusRenderer,
      sorter: stringSorter('crossCheckStatus'),
    },
    { title: 'Max Score', dataIndex: 'maxScore' },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    { title: 'Score Weight', dataIndex: 'scoreWeight' },
    { title: 'Who Checks', dataIndex: 'checker' },
    {
      title: 'Task Owner',
      dataIndex: ['taskOwner', 'githubId'],
      render: (value: string) => (value ? <GithubUserLink value={value} /> : null),
    },
    {
      title: 'Pairs',
      dataIndex: 'pairsCount',
    },
    {
      dataIndex: 'actions',
      width: 80,
      render: (_: any, record: CourseTaskDto) => {
        return getDropdownMenu(record);
      },
    },
  ];
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]}>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
