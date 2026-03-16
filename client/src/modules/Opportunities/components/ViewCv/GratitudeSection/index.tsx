import { Typography } from 'antd';
import { BaseSection } from '../BaseSection';
import { GratitudeList } from './GratitudeList';
import { GratitudeDto } from '@client/api';

const { Text } = Typography;

type Props = {
  data: GratitudeDto[] | null;
};

export const GratitudeSection = ({ data }: Props) => {
  if (!data?.length) {
    return null;
  }

  return (
    <BaseSection title="Gratitude">
      <Text>Total count: {data!.length}</Text>
      <br />
      <GratitudeList feedback={data} showCount={5} />
    </BaseSection>
  );
};
