import { PlayCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import { DEFAULT_COURSE_ICONS } from 'configs/course-icons';
import { Course } from 'services/models';

export const CourseIcon = ({ course }: { course: Course }) => {
  if (course.completed) {
    return course.logo && DEFAULT_COURSE_ICONS[course.logo] ? (
      <Logo url={DEFAULT_COURSE_ICONS[course.logo].archived} />
    ) : (
      <CheckCircleTwoTone style={{ display: 'inline' }} twoToneColor="#aaa" />
    );
  }
  return course.logo && DEFAULT_COURSE_ICONS[course.logo] ? (
    <Logo url={DEFAULT_COURSE_ICONS[course.logo].active} />
  ) : (
    <PlayCircleTwoTone style={{ display: 'inline' }} />
  );
};

function Logo({ url }: { url: string }) {
  return (
    <>
      <img width={16} height={16} src={url} className="img" />
      <style jsx>{`
        .img {
          vertical-align: -0.125em;
        }
      `}</style>
    </>
  );
}
