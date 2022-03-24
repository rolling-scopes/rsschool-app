import { useEffect, useState } from 'react';

export function Timer({ onElapsed, seconds }: { onElapsed: () => void; seconds: number }) {
  const [leftSeconds, setLeftSeconds] = useState(seconds);

  useEffect(() => {
    let timeout: NodeJS.Timer | undefined;

    if (leftSeconds > 0) {
      timeout = setTimeout(() => {
        setLeftSeconds(leftSeconds => leftSeconds - 1);
      }, 1000);
    } else {
      onElapsed();
    }
    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [leftSeconds]);

  return <>{leftSeconds} seconds</>;
}
