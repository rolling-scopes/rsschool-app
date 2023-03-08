import { useMemo, useState } from 'react';
import { GithubUserLink } from 'components/GithubUserLink';
import { SafetyCertificateTwoTone } from '@ant-design/icons';
import { colorTagRenderer, getColumnSearchProps, stringSorter, tagsRenderer, dateSorter } from 'components/Table';
import { formatDate } from 'services/formatter';
import { Course } from 'services/models';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import {
  mentorRegistryStyles,
  MentorRegistryTabsMode,
  MentorsRegistryColumnKey,
  MentorsRegistryColumnName,
  TABS,
  TabsMode,
} from '../constants';
import { FilterValue } from 'antd/lib/table/interface';
import { Button } from 'antd';
import { DisciplineDto, MentorRegistryDto, UpdateUserDtoLanguagesEnum } from 'api';

type ChildrenProp = {
  tagFilters: string[];
  filteredData: MentorRegistryDto[];
  columns: any[];
  handleTagClose: (tag: string) => void;
  handleClearAllButtonClick: () => void;
  handleTableChange: (_: any, filters: Record<MentorsRegistryColumnKey, FilterValue | string[] | null>) => void;
};

type Props = {
  data: MentorRegistryDto[];
  courses: Course[];
  activeTab: MentorRegistryTabsMode;
  handleModalDataChange: (mode: string, record: any) => void;
  children: (props: ChildrenProp) => JSX.Element;
  disciplines: DisciplineDto[];
};

export interface CombinedFilter {
  preselectedCourses: number[];
  preferredCourses: number[];
  technicalMentoring: string[];

  filterTags?: string[];
}

export const MentorRegistryTableContainer = ({
  children,
  data,
  courses,
  activeTab,
  handleModalDataChange,
  disciplines,
}: Props) => {
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [combinedFilter, setCombinedFilter] = useState<CombinedFilter>({
    preferredCourses: [],
    preselectedCourses: [],
    technicalMentoring: [],
  });

  const renderPreselectedCourses = (courses: Course[]) => {
    return (values: number[], record: any) => {
      return (
        <>
          {values
            .map(v => ({
              value: courses.find(c => c.id === v)?.name ?? v.toString(),
              alias: courses.find(c => c.id === v)?.alias ?? '',
              color: record.courses.includes(v) ? '#87d068' : undefined,
            }))
            .map(v => (v.color ? colorTagRenderer(v.value, v.color) : renderTagWithCopyButton(v.value, v.alias)))}
        </>
      );
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

  const renderInfo = (_: any, record: any) => {
    const isMentor = record.courses.some((id: string) => !record.preselectedCourses.includes(id));
    return (
      <div className="info-icons">
        {/* {record.englishMentoring ? <div title="Ready to mentor in English" className="icon-flag-uk" /> : null} */}
        {isMentor ? <div title="Mentor in the past" className="icon-mentor" /> : null}
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

  const filteredData = useMemo(() => {
    return data.filter(
      e =>
        (combinedFilter.technicalMentoring.length
          ? e.technicalMentoring.some(v => combinedFilter.technicalMentoring.includes(v))
          : true) &&
        (combinedFilter.preselectedCourses.length
          ? e.preselectedCourses.some(v => combinedFilter.preselectedCourses.includes(v))
          : true) &&
        (combinedFilter.preferredCourses.length
          ? e.preferedCourses.some(v => combinedFilter.preferredCourses.includes(v))
          : true),
    );
  }, [combinedFilter, data]);

  const handleTableChange = (_: any, filters: Record<MentorsRegistryColumnKey, FilterValue | string[] | null>) => {
    const combinedFilter: CombinedFilter = {
      preferredCourses: filters.preferedCourses?.map(c => Number(c)) ?? [],
      preselectedCourses: filters.preselectedCourses?.map(c => Number(c)) ?? [],
      technicalMentoring: filters.technicalMentoring?.map(v => v.toString()) ?? [],
    };

    const filterTag: string[] = [
      ...combinedFilter?.technicalMentoring?.map(v => `${MentorsRegistryColumnName.Tech}: ${v}`),
      ...combinedFilter.preselectedCourses?.map(
        v => `${MentorsRegistryColumnName.Preselected}: ${courses.find(i => i.id === v)?.name}`,
      ),
      ...combinedFilter.preferredCourses?.map(
        v => `${MentorsRegistryColumnName.PreferredCourses}: ${courses.find(i => i.id === v)?.name}`,
      ),
    ];

    setTagFilters(filterTag);
    setCombinedFilter(combinedFilter);
  };

  const getColumns = (combinedFilter: CombinedFilter, allCourses: Course[]) => {
    const { preferredCourses, preselectedCourses, technicalMentoring } = combinedFilter;
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
        width: 200,
        fixed: 'left',
      },
      {
        key: MentorsRegistryColumnKey.Info,
        title: MentorsRegistryColumnName.Info,
        dataIndex: MentorsRegistryColumnKey.Info,
        render: renderInfo,
        width: 100,
        align: 'center',
      },
      {
        key: MentorsRegistryColumnKey.PreferredCourses,
        title: MentorsRegistryColumnName.PreferredCourses,
        dataIndex: MentorsRegistryColumnKey.PreferredCourses,
        render: (values: number[]) => tagsRenderer(values.map(v => allCourses.find(c => c.id === v)?.name ?? v)),
        filters: allCourses.map(status => ({ text: status.name, value: status.id })),
        defaultFilteredValue: preferredCourses,
        filtered: preferredCourses?.length > 0,
        filteredValue: preferredCourses || null,
        width: 260,
      },
      {
        key: MentorsRegistryColumnKey.ReceivedDate,
        title: MentorsRegistryColumnName.ReceivedDate,
        dataIndex: MentorsRegistryColumnKey.ReceivedDate,
        render: (v: string) => formatDate(v),
        sorter: dateSorter('receivedDate'),
        width: 120,
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
        key: MentorsRegistryColumnKey.UpdatedDate,
        title: MentorsRegistryColumnName.UpdatedDate,
        dataIndex: MentorsRegistryColumnKey.UpdatedDate,
        render: (v: string) => formatDate(v),
        sorter: dateSorter('updatedDate'),
        width: 120,
      },
      {
        key: MentorsRegistryColumnKey.Tech,
        title: MentorsRegistryColumnName.Tech,
        dataIndex: MentorsRegistryColumnKey.Tech,
        render: tagsRenderer,
        filters: disciplines.map(discipline => {
          return { text: discipline.name, value: discipline.id };
        }),
        defaultFilteredValue: technicalMentoring,
        filtered: technicalMentoring?.length > 0,
        filteredValue: technicalMentoring || null,
        width: 210,
      },
      {
        key: MentorsRegistryColumnKey.City,
        title: MentorsRegistryColumnName.City,
        dataIndex: MentorsRegistryColumnKey.City,
        sorter: stringSorter('cityName'),
        ...getColumnSearchProps('cityName'),
      },
      {
        key: MentorsRegistryColumnKey.Languages,
        title: MentorsRegistryColumnName.Languages,
        dataIndex: MentorsRegistryColumnKey.Languages,
        render: tagsRenderer,
        //TODO
        filters: Object.values(UpdateUserDtoLanguagesEnum).map(language => {
          return { text: language, value: language };
        }),
        width: 130,
      },
      {
        key: MentorsRegistryColumnKey.StudentsLimit,
        title: MentorsRegistryColumnName.StudentsLimit,
        dataIndex: MentorsRegistryColumnKey.StudentsLimit,
        width: 130,
        align: 'center',
      },
      {
        key: MentorsRegistryColumnKey.PreferredLocation,
        title: MentorsRegistryColumnName.PreferredLocation,
        dataIndex: MentorsRegistryColumnKey.PreferredLocation,
        sorter: stringSorter('githubId'),
        align: 'center',
      },
      {
        key: MentorsRegistryColumnKey.Actions,
        title: MentorsRegistryColumnName.Actions,
        dataIndex: MentorsRegistryColumnKey.Actions,
        render: (_: any, record: any) => (
          <>
            <Button type="link" size="small" onClick={() => handleModalDataChange('invite', record)}>
              Invite
            </Button>
            {record.preselectedCourses.length && activeTab === TabsMode.New ? (
              <Button type="link" size="small" onClick={() => handleModalDataChange('re-send', record)}>
                Re-send
              </Button>
            ) : null}
            <Button type="link" size="small" onClick={() => handleModalDataChange('delete', record)}>
              Delete
            </Button>
          </>
        ),
        width: activeTab === TabsMode.New ? 210 : 140,
      },
    ];

    return allColumns.filter(column => TABS[activeTab].find(tab => tab === column.dataIndex));
  };

  const handleTagClose = (removedTag: string) => {
    const [removedTagName, removedTagValue] = removedTag.split(':');
    switch (removedTagName) {
      case MentorsRegistryColumnName.Tech: {
        setCombinedFilter(prevState => ({
          ...prevState,
          technicalMentoring: combinedFilter.technicalMentoring.filter(tag => tag !== removedTagValue.trim()),
        }));
      }
      case MentorsRegistryColumnName.PreferredCourses: {
        setCombinedFilter(prevState => ({
          ...prevState,
          preferredCourses: combinedFilter.preferredCourses.filter(
            tag => courses.find(i => i.id === tag)?.name !== removedTagValue.trim(),
          ),
        }));
      }
      case MentorsRegistryColumnName.Preselected: {
        setCombinedFilter(prevState => ({
          ...prevState,
          preselectedCourses: combinedFilter.preselectedCourses.filter(
            tag => courses.find(i => i.id === tag)?.name !== removedTagValue.trim(),
          ),
        }));
      }
      default:
        break;
    }
    setTagFilters(tagFilters.filter(f => f !== removedTag));
  };

  const handleClearAllButtonClick = () => {
    setCombinedFilter({ preferredCourses: [], technicalMentoring: [], preselectedCourses: [] });
    setTagFilters([]);
  };

  return children({
    tagFilters,
    filteredData,
    columns: getColumns(combinedFilter, courses),
    handleTagClose,
    handleClearAllButtonClick,
    handleTableChange,
  });
};
