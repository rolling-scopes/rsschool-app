import { Grid } from 'antd';
import { FormLayout } from 'antd/lib/form/Form';

const { useBreakpoint } = Grid;

export function useFormLayout() {
  const { xs, sm, md, lg, xl, xxl } = useBreakpoint();
  const largeScreenSizes = [md, lg, xl, xxl];
  const isSmallScreen = xs || (sm && !largeScreenSizes.some(Boolean));
  const formLayout: FormLayout = isSmallScreen ? 'vertical' : 'horizontal';

  return { formLayout, isSmallScreen: xs } as const;
}
