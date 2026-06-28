import { dynamicWithSkeleton } from '@client/utils/dynamicWithSkeleton';

export const DynamicHomeSummary = dynamicWithSkeleton(() => import('./HomeSummary'));

export default DynamicHomeSummary;
