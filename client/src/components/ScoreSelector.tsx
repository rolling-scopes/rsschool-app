import { ScoreCard } from './ScoreCard';
import { theme } from 'antd';

type ScoreSelectorProps = {
  value?: number;
  onChange?: (value: number) => void;
};

export const ScoreSelector: React.FC<ScoreSelectorProps> = ({ value, onChange }) => {
  const { token } = theme.useToken();
  return (
    <div className="container">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
        <ScoreCard key={num} value={num} selected={value === num} onSelect={() => onChange?.(num)} />
      ))}
      <div className="score-sloth">{value && <span className="sloth-score-card">{value}</span>}</div>
      <style jsx>{`
        .container {
          display: flex;
          justify-content: left;
          gap: 12px;
          padding: 10px 0 20px;
          margin-bottom: 30px;
          position: relative;
        }
        .score-sloth {
          position: absolute;
          right: 0;
          bottom: -100px;
          width: 100px;
          height: 100px;
          background-image: url('https://cdn.rs.school/sloths/cleaned/its-a-good-job.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        .sloth-score-card {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 12px;
          width: 24px;
          text-align: center;
          right: -3px;
          top: 23px;
          font-size: 12px;
          font-weight: 900;
          background: ${token.colorBgContainer};
        }
      `}</style>
    </div>
  );
};
