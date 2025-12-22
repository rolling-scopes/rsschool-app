import { theme } from 'antd';
import type { CSSProperties } from 'react';
import styles from './ScoreCard.module.css';

type Props = {
  value: number;
  selected: boolean;
  onSelect: (value: number) => void;
};

export const ScoreCard: React.FC<Props> = ({ value, selected, onSelect }) => {
  const getSelectedClass = () => {
    if (!selected) return '';
    if (value <= 4) return styles.selectedRed;
    if (value <= 7) return styles.selectedYellow;
    return styles.selectedGreen;
  };
  const { token } = theme.useToken();
  const styleVars = {
    '--card-bg': token.colorBgContainerDisabled,
    '--card-border': token.colorBorder,
    '--card-error': token.colorError,
    '--card-error-bg': token.colorErrorBg,
    '--card-warning': token.colorWarning,
    '--card-warning-bg': token.colorWarningBg,
    '--card-success': token.colorSuccess,
    '--card-success-bg': token.colorSuccessBg,
  } as CSSProperties;

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''} ${getSelectedClass()}`}
      onClick={() => onSelect(value)}
      style={styleVars}
    >
      {value}
      <div className={styles.cardStick} />
    </div>
  );
};
