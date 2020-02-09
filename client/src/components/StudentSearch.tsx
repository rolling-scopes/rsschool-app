import { useEffect, useState, useCallback, useMemo } from 'react';
import { Select } from 'antd';
import { get } from 'lodash';
import { GithubAvatar } from 'components';
import { CourseService } from 'services/course';

type Person = { id: number; githubId: string; name: string };

type Props = {
  [key: string]: any;
  defaultValues?: Person[];
  courseId: number;
  keyField?: 'id' | 'githubId';
};

export function StudentSearch(props: Props) {
  const [data, setData] = useState<Person[]>([]);

  useEffect(() => setData(props.defaultValues ?? []), [props.defaultValues]);
  const courseService = useMemo(() => new CourseService(props.courseId), [props.courseId]);
  const handleSearch = useCallback(
    async (value: string) => {
      if (value) {
        const data = await courseService.searchCourseStudent(value);
        setData(data);
      } else {
        setData(props.defaultValues ?? []);
      }
    },
    [props.defaultValues, courseService],
  );

  const { keyField, courseId, defaultValues, ...otherProps } = props;
  return (
    <Select
      {...otherProps}
      showSearch
      defaultValue={undefined}
      defaultActiveFirstOption={false}
      showArrow={defaultValues ? Boolean(defaultValues.length) : false}
      filterOption={false}
      onSearch={handleSearch}
      placeholder={defaultValues?.length ?? 0 > 0 ? 'Select...' : 'Search...'}
      notFoundContent={null}
      style={{ width: '100%' }}
    >
      {data.map(person => (
        <Select.Option key={person.id} value={keyField ? get(person, keyField) : person.id}>
          <GithubAvatar size={24} githubId={person.githubId} /> {person.name} ({person.githubId})
        </Select.Option>
      ))}
    </Select>
  );
}
