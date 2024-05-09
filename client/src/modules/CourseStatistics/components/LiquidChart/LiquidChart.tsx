import { Liquid, LiquidConfig } from '@ant-design/plots';
import { Colors } from '../../data';

type Props = {
  count: number;
  total: number;
  color?: Colors;
};

function LiquidChart({ count, total, color = Colors.Blue }: Props) {
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
    color: () => color,
  };
  return <Liquid {...config} />;
}

export default LiquidChart;
