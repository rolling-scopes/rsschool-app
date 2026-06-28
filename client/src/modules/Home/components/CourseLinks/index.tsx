import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

export const DynamicCourseLinks = dynamicWithSkeleton(() => import('./CourseLinks'));

export default DynamicCourseLinks;
