import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

export const DynamiCourseLinks = dynamicWithSkeleton(() => import('./CourseLinks'));

export default DynamiCourseLinks;
