import { UserSearch, UserProps } from 'components/UserSearch';
import { useCallback, useMemo } from 'react';
import { CourseService } from 'services/course';

type Props = UserProps & {
  courseId: number;
  onlyStudentsWithoutMentorShown?: boolean;
};

export function StudentSearch(props: Props) {
  const { courseId, ...otherProps } = props;
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const handleSearch = useCallback(
    async (value: string, onlyStudentsWithoutMentorShown = false) =>
      courseService.searchStudents(value, onlyStudentsWithoutMentorShown),
    [courseService],
  );

  return <UserSearch {...otherProps} searchFn={handleSearch} />;
}
