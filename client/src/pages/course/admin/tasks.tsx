import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, message, Table } from 'antd';
import { CoursesTasksApi, CourseTaskDto } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import { AdminPageLayout } from 'components/PageLayout';
import { crossCheckDateRenderer, crossCheckStatusRenderer, dateRenderer, stringSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { withSession } from 'components/withSession';
import { CourseTaskModal } from 'modules/CourseManagement/components/CourseTaskModal';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CrossCheckStatus } from 'services/course';
import { CoursePageProps } from 'services/models';

const { Item, Divider } = Menu;
const courseTasksApi = new CoursesTasksApi();

function Page(props: CoursePageProps) {
  const courseId = props.course.id;
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as CourseTaskDto[]);
  const [modalData, setModalData] = useState(null as Partial<CourseTaskDto> | null);
  const [modalAction, setModalAction] = useState('update');

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await courseTasksApi.getCourseTasks(courseId);
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
      await courseTasksApi.deleteCourseTask(props.course.id, id);
      await loadData();
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const handleModalSubmit = async (record: any) => {
    if (modalAction === 'update') {
      await courseTasksApi.updateCourseTask(props.course.id, modalData!.id!, record);
    } else {
      const { ...rest } = record;
      await courseTasksApi.createCourseTask(props.course.id, rest);
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

    return (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu style={{ width: 200 }}>
            <Item onClick={() => handleEditItem(record)}>Edit</Item>
            <Item onClick={() => handleDeleteItem(record.id)}>Delete</Item>
            {hasTaskDistibute && <Item onClick={() => handleTaskDistribute(record)}>Distribute</Item>}
            {hasInterviewDistibute && <Item onClick={() => handleInterviewDistribute(record)}>Distribute</Item>}
            {hasCrossCheck && <Divider />}
            {hasCrossCheck && (
              <Item disabled={!isSubmitDeadlinePassed} onClick={() => handleCrossCheckDistribution(record)}>
                Cross-Check: Distribute
              </Item>
            )}
            {hasCrossCheck && (
              <Item
                disabled={!isSubmitDeadlinePassed || record.crossCheckStatus === CrossCheckStatus.Initial}
                onClick={() => handleCrossCheckCompletion(record)}
              >
                Cross-Check: Complete
              </Item>
            )}
          </Menu>
        }
      >
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
        message.warn('Cross-check pairs were not created because there are no submitted solutions');
      }
    } catch (e) {
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
    <AdminPageLayout loading={loading} session={props.session} courses={[props.course]}>
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
      />
      <CourseTaskModal onCancel={() => setModalData(null)} onSubmit={handleModalSubmit} data={modalData} />
    </AdminPageLayout>
  );
}

function getColumns(getDropdownMenu: (record: CourseTaskDto) => any) {
  return [
    { title: 'Id', dataIndex: 'id' },
    {
      title: 'Name',
      dataIndex: 'name',
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

export default withCourseData(withSession(Page));
