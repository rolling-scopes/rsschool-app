import { Image, ImageProps } from 'antd';

export const slothNames = [
  'activist',
  'aws-teamwork',
  'codewars',
  'congrats',
  'congratulations',
  'congratulations-russian',
  'deadline',
  'error',
  'error-denied',
  'everything-works',
  'everything-works-russian',
  'expert',
  'feature-in-disguise',
  'finished-work',
  'git-problem',
  'git-remote',
  'github-friends',
  'glory-to-ukraine',
  'google',
  'google-russian',
  'helper',
  'hero',
  'how-i-see-russian',
  'hugs-with-aws',
  'i-saw-your-pr',
  'interview-with-mentor',
  'its-a-good-job',
  'junior',
  'junior-russian',
  'lecture-with-mentor',
  'llike-aws',
  'mentor',
  'mentor-with-his-students',
  'no-mentor-russian',
  'not-a-bug-russian',
  'one-hour-before-deadline',
  'reading-the-chat',
  'shocked',
  'slothzy',
  'slothzy-russian',
  'so-little-work-i-done',
  'so-little-work-i-done-russian',
  'student-without-mentor',
  'student1',
  'super-mentor',
  'team-work-with-boxes',
  'thanks',
  'thanks-russian',
  'this-is-love',
  'this-is-love-russian',
  'time-to-pay',
  'train',
  'wanted-mentors',
  'welcome',
  'what-do-you-want-russian',
  'what-is-it',
  'with-boxes',
  'wtf',
] as const;

export type SlothNames = typeof slothNames[number];

interface Props extends ImageProps {
  name: SlothNames;
  imgExtension?: 'svg' | 'png';
}

const slothsBaseURL = 'https://cdn.rs.school/sloths/stickers/';

export function SlothImage({ name, imgExtension = 'svg', ...props }: Props) {
  const src = `${slothsBaseURL}${name}/image.${imgExtension}`;

  return <Image src={src} alt={name} preview={false} {...props} />;
}
