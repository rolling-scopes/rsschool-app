import { CourseDto } from '@client/api';
import { CourseIcon } from '@client/shared/components/Icons';
import { formatMonthFriendly } from 'services/formatter';
import { LABELS } from 'modules/Registry/constants';

type Props = {
  course: CourseDto;
  isStudentForm?: boolean;
};

export function CourseLabel({ course, isStudentForm }: Props) {
  const { discipline, name, startDate, personalMentoringStartDate, personalMentoringEndDate } = course;
  const disciplineName = discipline?.name ? `${discipline.name}, ` : '';
  const courseInfo = isStudentForm
    ? ` ${name} (${disciplineName}${formatMonthFriendly(startDate)}) `
    : ` ${name} (${LABELS.mentoring} ${
        personalMentoringStartDate ? formatMonthFriendly(personalMentoringStartDate) : ''
      }-${personalMentoringEndDate ? formatMonthFriendly(personalMentoringEndDate) : ''}) `;
  return (
    <>
      <CourseIcon course={course} />
      {courseInfo}
    </>
  );
}
