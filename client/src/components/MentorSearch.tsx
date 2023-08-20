import { CourseMentorsApi } from 'api';
import { UserSearch, UserProps } from 'components/UserSearch';
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
