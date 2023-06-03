import { UserSearch, UserProps } from 'components/UserSearch';
import { useCallback, useMemo } from 'react';
import { CourseService } from 'services/course';

type Props = UserProps & {
  courseId: number;
};

export function MentorSearch(props: Props) {
  const { courseId, ...otherProps } = props;
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const handleSearch = useCallback(async (value: string) => courseService.searchMentors(value), [courseService]);

  return <UserSearch {...otherProps} searchFn={handleSearch} />;
}
