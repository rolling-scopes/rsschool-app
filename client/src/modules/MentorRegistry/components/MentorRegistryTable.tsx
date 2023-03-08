import React from 'react';
import { Form, Table } from 'antd';
import FilteredTags from 'modules/Schedule/components/FilteredTags';
import { FilterValue } from 'antd/lib/table/interface';
import { MentorRegistryDto } from 'api';
import { MentorsRegistryColumnKey, PAGINATION } from '../constants';

type Props = {
  tagFilters: string[];
  filteredData: MentorRegistryDto[];
  columns: any[];
  handleTagClose: (tag: string) => void;
  handleClearAllButtonClick: () => void;
  handleTableChange: (_: any, filters: Record<MentorsRegistryColumnKey, FilterValue | string[] | null>) => void;
};

export function MentorRegistryTable(props: Props) {
  const { tagFilters, filteredData, columns, handleTagClose, handleClearAllButtonClick, handleTableChange } = props;
  const [form] = Form.useForm();

  return (
    <Form form={form} component={false}>
      <FilteredTags
        tagFilters={tagFilters}
        onTagClose={handleTagClose}
        onClearAllButtonClick={handleClearAllButtonClick}
      />
      <Table<MentorRegistryDto>
        pagination={{ pageSize: PAGINATION }}
        size="large"
        rowKey="id"
        dataSource={filteredData}
        scroll={{ x: 1600 }}
        columns={columns}
        onChange={handleTableChange}
      />
    </Form>
  );
}
