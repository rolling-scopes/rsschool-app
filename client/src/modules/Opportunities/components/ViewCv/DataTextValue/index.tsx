import { PropsWithChildren } from 'react';

import styles from './DataTextValue.module.css';

export const DataTextValue = ({ children }: PropsWithChildren<unknown>) => {
  return <span className={styles.value}>{children}</span>;
};
