import { SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { get } from 'lodash';

let searchInput: any;
export function getColumnSearchProps(dataIndex: string, label?: string) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => (searchInput = node)}
          onKeyDown={e => (e.keyCode === 13 ? confirm() : undefined)}
          placeholder={`Search ${label || dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys([e.target.value])}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button onClick={confirm} type="primary" icon={<SearchOutlined />} size="small" style={{ width: 90, marginRight: 8 }}>
          Search
        </Button>
        <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value: any, record: any) => {
      return (get(record as any, dataIndex) || '')
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible && searchInput) {
        setTimeout(() => searchInput.select());
      }
    },
  };
}
