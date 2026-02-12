import styles from './AlertDescription.module.css';

export const AlertDescription = ({ backgroundImage }: { backgroundImage?: string }) => {
  return <div className={styles.icon} style={{ backgroundImage }} />;
};
