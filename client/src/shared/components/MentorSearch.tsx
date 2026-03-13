import { CourseMentorsApi } from '@client/api';
import { UserSearch, UserProps } from '@client/shared/components/UserSearch';
import { useCallback } from 'react';

type Props = UserProps & {
  courseId: number;
};

const courseMentorsApi = new CourseMentorsApi();

export function MentorSearch(props: Props) {
  const { courseId, ...otherProps } = props;
  const handleSearch = useCallback(
    async (value: string) => {
      const { data } = await courseMentorsApi.searchMentors(courseId, value);
      return data;
    },
    [courseId],
  );

  return <UserSearch {...otherProps} searchFn={handleSearch} />;
}
