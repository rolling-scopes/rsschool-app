import React, { Dispatch, SetStateAction } from 'react';
import { Form, Table, TablePaginationConfig } from 'antd';
import FilteredTags from 'modules/Schedule/components/FilteredTags';
import { FilterValue } from 'antd/lib/table/interface';
import { MentorRegistryDto } from 'api';
import { MentorRegistryTabsMode, MentorsRegistryColumnKey, PAGINATION } from '../constants';
import { ColumnType } from 'antd/lib/table';

type Props = {
  setCurrentPage: Dispatch<SetStateAction<number>>;
  total: Record<MentorRegistryTabsMode, number>;
  currentPage: number;
  tagFilters: string[];
  filteredData: MentorRegistryDto[];
  columns: ColumnType<MentorRegistryDto>[];
  handleTagClose: (tag: string) => void;
  handleClearAllButtonClick: () => void;
  handleTableChange: (
    _: TablePaginationConfig,
    filters: Record<MentorsRegistryColumnKey, FilterValue | string[] | null>,
  ) => void;
  activeTab: MentorRegistryTabsMode;
};

export function MentorRegistryTable(props: Props) {
  const {
    currentPage,
    total,
    tagFilters,
    filteredData,
    columns,
    handleTagClose,
    handleClearAllButtonClick,
    handleTableChange,
    setCurrentPage,
    activeTab,
  } = props;
  const [form] = Form.useForm();

  const tableWidth = 2000;
  return (
    <Form form={form} component={false}>
      <FilteredTags
        tagFilters={tagFilters}
        onTagClose={handleTagClose}
        onClearAllButtonClick={handleClearAllButtonClick}
      />
      <Table<MentorRegistryDto>
        pagination={{ pageSize: PAGINATION, current: currentPage, onChange: setCurrentPage, total: total[activeTab] }}
        rowKey="id"
        dataSource={filteredData}
        scroll={{ x: tableWidth, y: 'calc(95vh - 340px)' }}
        columns={columns}
        onChange={handleTableChange}
      />
    </Form>
  );
}
