import { theme } from 'antd';

type Props = {
  value: number;
  selected: boolean;
  onSelect: (value: number) => void;
};

export const ScoreCard: React.FC<Props> = ({ value, selected, onSelect }) => {
  const getSelectedClass = () => {
    if (!selected) return '';
    if (value <= 4) return 'selected-red';
    if (value <= 7) return 'selected-yellow';
    return 'selected-green';
  };
  const { token } = theme.useToken();
  return (
    <>
      <div className={`card ${selected ? 'selected' : ''} ${getSelectedClass()}`} onClick={() => onSelect(value)}>
        {value}
        <div className="card-stick" />
      </div>
      <style jsx>{`
        .card {
          position: relative;
          transform-style: preserve-3d;
          width: 56px;
          height: 40px;
          background: ${token.colorBgContainerDisabled};
          border: 2px solid ${token.colorBorder};
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          transform: rotateX(40deg);
          transform-origin: bottom;
          transition:
            transform 0.5s ease,
            box-shadow 0.5s ease,
            background 0.5s ease,
            border-color 0.5s ease;
        }

        .card:hover,
        .card.selected {
          transform: rotateX(0deg) translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .selected-red {
          border-color: ${token.colorError};
          background: ${token.colorErrorBg};
        }

        .selected-yellow {
          border-color: ${token.colorWarning};
          background: ${token.colorWarningBg};
        }

        .selected-green {
          border-color: ${token.colorSuccess};
          background: ${token.colorSuccessBg};
        }

        .card-stick {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 20px;
          background: #999;
          border-radius: 0 0 3px 3px;
          pointer-events: none;
        }

        .selected-red .card-stick {
          background: ${token.colorError};
        }

        .selected-yellow .card-stick {
          background: ${token.colorWarning};
        }

        .selected-green .card-stick {
          background: ${token.colorSuccess};
        }
      `}</style>
    </>
  );
};
