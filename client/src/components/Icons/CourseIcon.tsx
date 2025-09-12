import { CheckCircleTwoTone, PlayCircleTwoTone } from '@ant-design/icons';
import { DEFAULT_COURSE_ICONS } from 'configs/course-icons';
import { Course } from 'services/models';
import { PublicSvgIcon } from '@client/components/Icons/PublicSvgIcon';

export const CourseIcon = ({ course }: { course: Course }) => {
  if (course.completed) {
    return course.logo && DEFAULT_COURSE_ICONS[course.logo] ? (
      <Logo url={DEFAULT_COURSE_ICONS[course.logo]?.archived ?? ''} />
    ) : (
      <CheckCircleTwoTone style={{ display: 'inline' }} twoToneColor="#aaa" />
    );
  }
  return course.logo && DEFAULT_COURSE_ICONS[course.logo] ? (
    <Logo url={DEFAULT_COURSE_ICONS[course.logo]?.active ?? ''} />
  ) : (
    <PlayCircleTwoTone style={{ display: 'inline' }} />
  );
};

function Logo({ url }: { url: string }) {
  return <PublicSvgIcon src={url} size="16px" />;
}
