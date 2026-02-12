import { ScoreCard } from './ScoreCard';
import { theme } from 'antd';
import styles from './ScoreSelector.module.css';

type ScoreSelectorProps = {
  value?: number;
  onChange?: (value: number) => void;
};

export const ScoreSelector: React.FC<ScoreSelectorProps> = ({ value, onChange }) => {
  const { token } = theme.useToken();
  return (
    <div className={styles.container}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
        <ScoreCard key={num} value={num} selected={value === num} onSelect={() => onChange?.(num)} />
      ))}
      <div className={styles.scoreSloth}>
        {value && (
          <span className={styles.slothScoreCard} style={{ background: token.colorBgContainer }}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
};
