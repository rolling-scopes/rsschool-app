import { useState, useEffect } from 'react';
import { Select, Typography } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import get from 'lodash/get';
import { SelectProps } from 'antd/lib/select';
import type { SearchStudent } from 'services/course';

type Person = { id: number; githubId: string; name: string } | SearchStudent;

export type UserProps = SelectProps<string> & {
  searchFn?: (value: string, onlyStudentsWithoutMentorShown?: boolean) => Promise<Person[]>;
  defaultValues?: Person[];
  keyField?: 'id' | 'githubId';
  showMentor?: boolean;
  onlyStudentsWithoutMentorShown?: boolean;
};

export function UserSearch(props: UserProps) {
  const [data, setData] = useState<Person[]>([]);
  const {
    searchFn = defaultSearch,
    defaultValues,
    keyField,
    showMentor,
    onlyStudentsWithoutMentorShown,
    ...otherProps
  } = props;

  useEffect(() => {
    setData(defaultValues ?? []);
  }, [props.defaultValues]);

  const handleSearch = async (value: string) => {
    value = value.trim();
    if (value) {
      const data = await searchFn(value, onlyStudentsWithoutMentorShown);
      setData(data);
    } else {
      setData(props.defaultValues ?? []);
    }
  };

  return (
    <Select
      showSearch
      allowClear
      {...otherProps}
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
            {showMentor && (person as SearchStudent).mentor ? (
              <Typography.Paragraph type="warning">
                Current mentor: {(person as SearchStudent).mentor?.githubId}
              </Typography.Paragraph>
            ) : (
              ''
            )}
          </Select.Option>
        );
      })}
    </Select>
  );

  async function defaultSearch(value: string) {
    return defaultValues?.filter(v => v.name.startsWith(value) || v.githubId.startsWith(value)) ?? [];
  }
}
