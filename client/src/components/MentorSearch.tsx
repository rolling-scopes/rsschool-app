import { UserSearch, UserProps } from 'components/UserSearch';
import { useCallback, useMemo } from 'react';
import { CourseService } from 'services/course';

type Props = UserProps & {
  courseId: number;
};

export function MentorSearch(props: Props) {
  const courseService = useMemo(() => new CourseService(props.courseId), [props.courseId]);
  const handleSearch = useCallback(async (value: string) => courseService.searchMentors(value), [courseService]);

  return <UserSearch {...props} searchFn={handleSearch} />;
}
