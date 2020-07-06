import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { GithubAvatar } from 'components';
import { get } from 'lodash';
import { SelectProps } from 'antd/lib/select';

type Person = { id: number; githubId: string; name: string };

export type UserProps = SelectProps<string> & {
  searchFn?: (value: string) => Promise<Person[]>;
  defaultValues?: Person[];
  keyField?: 'id' | 'githubId';
};

export function UserSearch(props: UserProps) {
  const [data, setData] = useState<Person[]>([]);
  const { searchFn = defaultSearch, defaultValues, keyField, ...otherProps } = props;

  useEffect(() => {
    setData(defaultValues ?? []);
  }, [props.defaultValues]);

  const handleSearch = async (value: string) => {
    if (value) {
      const data = await searchFn(value);
      setData(data);
    } else {
      setData(props.defaultValues ?? []);
    }
  };

  return (
    <Select
      {...otherProps}
      showSearch
      allowClear
      mode="multiple"
      defaultValue={undefined}
      defaultActiveFirstOption={false}
      showArrow={defaultValues ? Boolean(defaultValues.length) : false}
      filterOption={false}
      onSearch={handleSearch}
      placeholder={defaultValues?.length ?? 0 > 0 ? 'Select...' : 'Search...'}
      notFoundContent={null}
    >
      {data.map(person => {
        const key = keyField ? get(person, keyField) : person.id;
        return (
          <Select.Option key={key} value={key}>
            <GithubAvatar size={24} githubId={person.githubId} /> {person.name} ({person.githubId})
          </Select.Option>
        );
      })}
    </Select>
  );

  async function defaultSearch(value: string) {
    return defaultValues?.filter(v => v.name.startsWith(value) || v.githubId.startsWith(value)) ?? [];
  }
}
