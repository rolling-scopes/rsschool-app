import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { GithubAvatar } from 'components';
import { get } from 'lodash';

type Person = { id: number; githubId: string; name: string };

type Props = {
  [key: string]: any;
  searchFn: (value: string) => Promise<Person[]>;
  defaultValues?: Person[];
  keyField?: 'id' | 'githubId';
};

export function UserSearch(props: Props) {
  const [data, setData] = useState<Person[]>([]);

  useEffect(() => {
    setData(props.defaultValues ?? []);
  }, [props.defaultValues]);

  const handleSearch = async (value: string) => {
    if (value) {
      const data = await props.searchFn(value);
      setData(data);
    } else {
      setData(props.defaultValues ?? []);
    }
  };

  const { keyField, searchFn, defaultValues, ...otherProps } = props;
  return (
    <Select
      {...otherProps}
      showSearch
      allowClear={true}
      defaultValue={undefined}
      defaultActiveFirstOption={false}
      showArrow={defaultValues ? Boolean(defaultValues.length) : false}
      filterOption={false}
      onSearch={handleSearch}
      placeholder={defaultValues?.length ?? 0 > 0 ? 'Select...' : 'Search...'}
      notFoundContent={null}
    >
      {data.map(person => (
        <Select.Option key={person.id} value={keyField ? get(person, keyField) : person.id}>
          <GithubAvatar size={24} githubId={person.githubId} /> {person.name} ({person.githubId})
        </Select.Option>
      ))}
    </Select>
  );
}
