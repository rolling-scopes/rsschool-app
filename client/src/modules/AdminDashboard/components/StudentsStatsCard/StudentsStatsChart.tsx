import { Liquid, LiquidConfig } from '@ant-design/plots';
import { CourseStatsDto } from 'api';

type Props = {
  studentsStats: CourseStatsDto;
};

function StudentsStatsChart({ studentsStats }: Props) {
  const percent = studentsStats.studentsActiveCount / studentsStats.studentsTotalCount;
  const config: LiquidConfig = {
    percent: percent,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: {
      length: 128,
    },
  };
  return <Liquid {...config} />;
}

export default StudentsStatsChart;
