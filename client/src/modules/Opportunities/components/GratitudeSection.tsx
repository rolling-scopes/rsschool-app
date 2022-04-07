import { Typography } from 'antd';
import * as React from 'react';
import Section from './Section';
import { GratitudeList } from './GratitudeList';
import { GratitudeDto } from 'api';

const { Text } = Typography;

type Props = {
  data: GratitudeDto[] | null;
};

export function GratitudeSection({ data }: Props) {
  if (!data?.length) {
    return null;
  }

  return (
    <Section title="Gratitude">
      <Text>Total count: {data!.length}</Text>
      <br />
      <GratitudeList feedback={data} showCount={5} />
    </Section>
  );
}
