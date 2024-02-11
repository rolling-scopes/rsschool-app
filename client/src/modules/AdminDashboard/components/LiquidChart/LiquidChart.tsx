import { Liquid, LiquidConfig } from '@ant-design/plots';
import { Colors } from '../data';

type Props = {
  count: number;
  total: number;
  color?: keyof typeof Colors;
};

function LiquidChart({ count, total, color = Colors.blue }: Props) {
  const percent = count / total;
  const config: LiquidConfig = {
    percent: percent,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: {
      length: 128,
    },
    color: () => Colors[color],
  };
  return <Liquid {...config} />;
}

export default LiquidChart;
