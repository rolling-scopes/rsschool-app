import StarTwoTone from '@ant-design/icons/StarTwoTone';

enum Score {
  Outdated = 'gray',
  Min = '#ff0000',
  Average = '#ffa940',
  Max = '#52c41a',
  Undefined = '#13c2c2',
}

type Props = {
  score: number;
  maxScore: number | undefined;
  isOutdatedScore?: boolean;
};

export function ScoreIcon(props: Props) {
  const color = getColor(props);
  return <StarTwoTone twoToneColor={color} />;
}

function getColor({ maxScore, score, isOutdatedScore = false }: Props) {
  if (typeof maxScore === 'undefined') return Score.Undefined;
  if (isOutdatedScore) return Score.Outdated;
  if (score <= 0) return Score.Min;
  if (score === maxScore) return Score.Max;
  return Score.Average;
}
