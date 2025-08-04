import { Dispatch, SetStateAction } from 'react';
import { GithubUserLink } from 'components/GithubUserLink';
import { SafetyCertificateTwoTone } from '@ant-design/icons';
import { colorTagRenderer, getColumnSearchProps, stringSorter, tagsRenderer, dateSorter } from 'components/Table';
import { formatDate } from 'services/formatter';
import { Course } from 'services/models';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import { MentorsRegistryColumnKey, MentorsRegistryColumnName, TABS, MentorRegistryTabsMode } from '../constants';
import { FilterValue } from 'antd/lib/table/interface';
import { Button, Dropdown, Tooltip, message, theme } from 'antd';
import { MoreOutlined, MessageTwoTone } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import { DisciplineDto, MentorRegistryDto } from 'api';
import { ModalDataMode } from 'pages/admin/mentor-registry';
import css from 'styled-jsx/css';
import { PublicSvgIcon } from '@client/components/Icons';

interface ChildrenProp {
  setCurrentPage: Dispatch<SetStateAction<number>>;
  currentPage: number;
  total: Record<MentorRegistryTabsMode, number>;
  tagFilters: string[];
  filteredData: MentorRegistryDto[];
  columns: ColumnType<MentorRegistryDto>[];
  handleTagClose: (tag: string) => void;
  handleClearAllButtonClick: () => void;
  handleTableChange: (_: any, filters: Record<MentorsRegistryColumnKey, FilterValue | string[] | null>) => void;
  activeTab: MentorRegistryTabsMode;
}

interface Props {
  mentors: MentorRegistryDto[];
  courses: Course[];
  activeTab: MentorRegistryTabsMode;
  handleModalDataChange: (mode: ModalDataMode, record: MentorRegistryDto) => void;
  children: (props: ChildrenProp) => JSX.Element;
  disciplines: DisciplineDto[];
  tagFilters: string[];
  setTagFilters: Dispatch<SetStateAction<string[]>>;
  combinedFilter: CombinedFilter;
  setCombinedFilter: Dispatch<SetStateAction<CombinedFilter>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  currentPage: number;
  total: Record<MentorRegistryTabsMode, number>;
}

export interface CombinedFilter {
  preselectedCourses: number[];
  preferredCourses: number[];
  technicalMentoring: string[];
  githubId: string[];
  cityName: string[];
  filterTags?: string[];
  status: MentorRegistryTabsMode;
}

export const MentorRegistryTableContainer = ({
  children,
  mentors,
  courses,
  activeTab,
  handleModalDataChange,
  disciplines,
  tagFilters,
  setTagFilters,
  combinedFilter,
  setCombinedFilter,
  setCurrentPage,
  currentPage,
  total,
}: Props) => {
  const { token } = theme.useToken();

  const renderPreselectedCourses = (courses: Course[]) => {
    return (values: number[], record: MentorRegistryDto) => {
      return values
        .map(value => ({
          value: courses.find(course => course.id === value)?.name ?? value.toString(),
          alias: courses.find(course => course.id === value)?.alias ?? '',
          color: record.courses.includes(value) ? '#87d068' : undefined,
        }))
        .map(v => (v.color ? colorTagRenderer(v.value, v.color) : renderTagWithCopyButton(v.value, v.alias)));
    };
  };

  const renderTagWithCopyButton = (value: string, alias: string) => {
    const link = `${window.location.origin}/course/mentor/confirm?course=${alias}`;
    return (
      <>
        {colorTagRenderer(value)} <CopyToClipboardButton value={link} type="link" />
      </>
    );
  };

  const renderInfo = (_: any, record: MentorRegistryDto) => {
    const isMentor = record.courses.some(id => !record.preselectedCourses.includes(id));
    return (
      <div className="info-icons">
        {isMentor ? (
          <div title="Mentor in the past" style={{ color: token.colorTextSecondary }}>
            <PublicSvgIcon src="/static/svg/master-yoda.svg" size="1rem" />
          </div>
        ) : null}
        {record.comment && (
          <Tooltip placement="top" title={record.comment}>
            <MessageTwoTone />
          </Tooltip>
        )}
        {record.hasCertificate ? (
          <SafetyCertificateTwoTone
            title="Completed with certificate"
            className="icon-certificate"
            twoToneColor="#52c41a"
          />
        ) : null}
        <style jsx>{mentorRegistryStyles}</style>
      </div>
    );
  };

  const handleTableChange = async (
    _: any,
    filters: Record<MentorsRegistryColumnKey, FilterValue | string[] | null>,
  ) => {
    const combinedFilter: CombinedFilter = {
      preferredCourses: filters.preferedCourses?.map(course => Number(course)) ?? [],
      preselectedCourses: filters.preselectedCourses?.map(course => Number(course)) ?? [],
      technicalMentoring: filters.technicalMentoring?.map(discipline => discipline.toString()) ?? [],
      githubId: filters.githubId?.map(discipline => discipline.toString()) ?? [],
      cityName: filters.cityName?.map(discipline => discipline.toString()) ?? [],
      status: activeTab,
    };

    const filterTag: string[] = [
      ...combinedFilter.technicalMentoring.map(discipline => `${MentorsRegistryColumnName.Tech}: ${discipline}`),
      ...combinedFilter.preselectedCourses.map(
        preselectedCourse =>
          `${MentorsRegistryColumnName.Preselected}: ${courses.find(course => course.id === preselectedCourse)?.name}`,
      ),
      ...combinedFilter.preferredCourses.map(
        preferredCourse =>
          `${MentorsRegistryColumnName.PreferredCourses}: ${
            courses.find(course => course.id === preferredCourse)?.name
          }`,
      ),
    ];

    setTagFilters(filterTag);
    setCombinedFilter(combinedFilter);
  };

  const renderRestActions = (record: MentorRegistryDto) => {
    return (
      <Dropdown
        menu={{
          items: [
            activeTab === MentorRegistryTabsMode.New
              ? {
                  key: 'resend',
                  label: 'Re-send',
                  onClick: () => handleModalDataChange(ModalDataMode.Resend, record),
                  disabled: !record.preselectedCourses.length,
                }
              : null,
            {
              key: 'delete',
              label: 'Delete',
              onClick: () => handleModalDataChange(ModalDataMode.Delete, record),
            },
            {
              key: 'comment',
              label: record.comment ? 'Edit comment' : 'Add comment',
              onClick: () => handleModalDataChange(ModalDataMode.Comment, record),
            },
          ],
        }}
      >
        <Button type="link">
          <MoreOutlined />
        </Button>
      </Dropdown>
    );
  };

  const getColumns = (combinedFilter: CombinedFilter, allCourses: Course[]): ColumnType<MentorRegistryDto>[] => {
    const { preferredCourses, preselectedCourses, technicalMentoring, githubId, cityName } = combinedFilter;
    const allColumns = [
      {
        key: MentorsRegistryColumnKey.Github,
        title: MentorsRegistryColumnName.Github,
        dataIndex: MentorsRegistryColumnKey.Github,
        render: (value: string, { name }: { name: string }) => {
          return (
            <>
              <GithubUserLink value={value} />
              <div>{name}</div>
            </>
          );
        },
        sorter: stringSorter('githubId'),
        ...getColumnSearchProps(['githubId', 'name']),
        onFilter: undefined,
        width: 200,
        fixed: 'left' as const,
        filteredValue: githubId || null,
      },
      {
        key: MentorsRegistryColumnKey.Info,
        title: MentorsRegistryColumnName.Info,
        dataIndex: MentorsRegistryColumnKey.Info,
        render: renderInfo,
        width: 100,
        filteredValue: null,
      },
      {
        key: MentorsRegistryColumnKey.PreferredCourses,
        title: MentorsRegistryColumnName.PreferredCourses,
        dataIndex: MentorsRegistryColumnKey.PreferredCourses,
        render: (courses: number[]) =>
          tagsRenderer(
            courses.map(course => allCourses.find(preferredCourse => preferredCourse.id === course)?.name ?? course),
          ),
        filters: allCourses.map(status => ({ text: status.name, value: status.id })),
        defaultFilteredValue: preferredCourses,
        filtered: preferredCourses?.length > 0,
        filteredValue: preferredCourses || null,
        width: 240,
      },
      {
        key: MentorsRegistryColumnKey.ReceivedDate,
        title: MentorsRegistryColumnName.ReceivedDate,
        dataIndex: MentorsRegistryColumnKey.ReceivedDate,
        render: (date: string) => formatDate(date),
        sorter: dateSorter('receivedDate'),
        width: 120,
        filteredValue: null,
      },
      {
        key: MentorsRegistryColumnKey.Preselected,
        title: MentorsRegistryColumnName.Preselected,
        dataIndex: MentorsRegistryColumnKey.Preselected,
        render: renderPreselectedCourses(allCourses),
        filters: allCourses?.map(status => ({ text: status.name, value: status.id })),
        defaultFilteredValue: preselectedCourses,
        filtered: preselectedCourses?.length > 0,
        filteredValue: preselectedCourses || null,
        width: 260,
      },
      {
        key: MentorsRegistryColumnKey.SendDate,
        title: MentorsRegistryColumnName.SendDate,
        dataIndex: MentorsRegistryColumnKey.SendDate,
        render: (date: string) => formatDate(date),
        sorter: dateSorter('sendDate'),
        width: 120,
        filteredValue: null,
      },
      {
        key: MentorsRegistryColumnKey.Tech,
        title: MentorsRegistryColumnName.Tech,
        dataIndex: MentorsRegistryColumnKey.Tech,
        render: tagsRenderer,
        filters: disciplines.map(discipline => {
          return { text: discipline.name, value: discipline.name };
        }),
        defaultFilteredValue: technicalMentoring,
        filtered: technicalMentoring?.length > 0,
        filteredValue: technicalMentoring || null,
        width: 240,
      },
      {
        key: MentorsRegistryColumnKey.City,
        title: MentorsRegistryColumnName.City,
        dataIndex: MentorsRegistryColumnKey.City,
        sorter: stringSorter('cityName'),
        width: 150,
        ...getColumnSearchProps('cityName'),
        onFilter: undefined,
        filteredValue: cityName || null,
      },
      {
        key: MentorsRegistryColumnKey.Languages,
        title: MentorsRegistryColumnName.Languages,
        dataIndex: MentorsRegistryColumnKey.Languages,
        render: tagsRenderer,
        width: 130,
        filteredValue: null,
      },
      {
        key: MentorsRegistryColumnKey.StudentsLimit,
        title: MentorsRegistryColumnName.StudentsLimit,
        dataIndex: MentorsRegistryColumnKey.StudentsLimit,
        width: 130,
        filteredValue: null,
      },
      {
        key: MentorsRegistryColumnKey.PreferredLocation,
        title: MentorsRegistryColumnName.PreferredLocation,
        dataIndex: MentorsRegistryColumnKey.PreferredLocation,
        sorter: stringSorter('githubId'),
        filteredValue: null,
      },
      {
        key: MentorsRegistryColumnKey.Actions,
        title: MentorsRegistryColumnName.Actions,
        dataIndex: MentorsRegistryColumnKey.Actions,
        render: (_: any, record: MentorRegistryDto) => (
          <>
            <Button type="link" size="small" onClick={() => handleModalDataChange(ModalDataMode.Invite, record)}>
              Invite
            </Button>
            {renderRestActions(record)}
          </>
        ),
        width: 140,
        fixed: 'right' as const,
      },
    ];

    return allColumns.filter(column => TABS[activeTab].find(tab => tab === column.dataIndex));
  };

  const handleTagClose = (removedTag: string) => {
    const [removedTagName, removedTagValue] = removedTag.split(':');
    switch (removedTagName) {
      case MentorsRegistryColumnName.Tech:
        {
          setCombinedFilter(prevState => ({
            ...prevState,
            technicalMentoring: combinedFilter.technicalMentoring.filter(tag => tag !== removedTagValue.trim()),
          }));
        }
        break;
      case MentorsRegistryColumnName.PreferredCourses:
        {
          setCombinedFilter(prevState => ({
            ...prevState,
            preferredCourses: combinedFilter.preferredCourses.filter(
              tag => courses.find(course => course.id === tag)?.name !== removedTagValue.trim(),
            ),
          }));
        }
        break;
      case MentorsRegistryColumnName.Preselected:
        {
          setCombinedFilter(prevState => ({
            ...prevState,
            preselectedCourses: combinedFilter.preselectedCourses.filter(
              tag => courses.find(course => course.id === tag)?.name !== removedTagValue.trim(),
            ),
          }));
        }
        break;
      default:
        message.error('An error occurred. Please try again later.');
        break;
    }
    setTagFilters(tagFilters.filter(filter => filter !== removedTag));
  };

  const handleClearAllButtonClick = () => {
    setCombinedFilter(prev => ({
      preferredCourses: [],
      technicalMentoring: [],
      preselectedCourses: [],
      githubId: [],
      cityName: [],
      status: prev.status,
    }));
    setTagFilters([]);
  };

  return children({
    tagFilters,
    filteredData: mentors,
    columns: getColumns(combinedFilter, courses),
    currentPage,
    total,
    handleTagClose,
    handleClearAllButtonClick,
    handleTableChange,
    setCurrentPage,
    activeTab,
  });
};

const mentorRegistryStyles = css`
  .info-icons {
    display: flex;
    justify-content: center;
  }

  .info-icons > div {
    margin-right: 8px;
  }

  :global(.icon-certificate svg) {
    width: 16px;
    height: 16px;
  }

  .icon-flag-uk {
    background-image: url(/static/images/united-kingdom.png);
    background-position: center;
    background-size: contain;
    width: 16px;
    height: 16px;
  }
`;
