import { Tag } from 'antd';
import { CourseDto } from 'api';
import { CourseIcon } from 'components/Icons';
import { formatMonthFriendly } from 'services/formatter';

type Props = {
  course: CourseDto;
};

export function CourseLabel({ course }: Props) {
  const { planned, discipline, name, startDate } = course;
  const disciplineName = discipline?.name ? `${discipline.name}, ` : '';
  const courseInfo = ` ${name} (${disciplineName}${formatMonthFriendly(startDate)}) `;
  const tag = planned ? <Tag color="orange">Planned</Tag> : <Tag color="green">In Progress</Tag>;

  return (
    <>
      <CourseIcon course={course} />
      {courseInfo}
      {tag}
    </>
  );
}
