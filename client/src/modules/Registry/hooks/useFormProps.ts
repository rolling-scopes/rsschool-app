import { Form, Grid } from 'antd';
import { FormLayout } from 'antd/lib/form/Form';

const { useBreakpoint } = Grid;

export function useFormProps() {
  const [form] = Form.useForm();
  const { xs, sm, md, lg, xl, xxl } = useBreakpoint();
  const largeScreenSizes = [md, lg, xl, xxl];
  const isSmallScreen = xs || (sm && !largeScreenSizes.some(Boolean));
  const formLayout: FormLayout = isSmallScreen ? 'vertical' : 'horizontal';

  return { form, formLayout, isSmallScreen: xs };
}
