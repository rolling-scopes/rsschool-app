import { Liquid, LiquidConfig } from '@ant-design/plots';
import { Colors } from '../../data';
import { GlobalToken, theme } from 'antd';

type Props = {
  count: number;
  total: number;
  color?: Colors;
  background?: GlobalToken;
};

function LiquidChart({ count, total, color = Colors.Blue, background }: Props) {
  const { token } = theme.useToken();
  const percent = count / total;
  const config: LiquidConfig = {
    theme: {
      background: background || token.colorBgContainer,
    },
    percent: percent,
    style: {
      fill: color,
      outlineBorder: 4,
      outlineDistance: 8,
      waveLength: 128,
    },
  };
  return <Liquid {...config} />;
}

export default LiquidChart;
