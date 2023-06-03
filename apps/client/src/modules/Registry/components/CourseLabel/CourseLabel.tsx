import { CourseDto } from 'api';
import { CourseIcon } from 'components/Icons';
import { formatMonthFriendly } from 'services/formatter';

type Props = {
  course: CourseDto;
};

export function CourseLabel({ course }: Props) {
  const { discipline, name, startDate } = course;
  const disciplineName = discipline?.name ? `${discipline.name}, ` : '';
  const courseInfo = ` ${name} (${disciplineName}${formatMonthFriendly(startDate)}) `;
  return (
    <>
      <CourseIcon course={course} />
      {courseInfo}
    </>
  );
}
