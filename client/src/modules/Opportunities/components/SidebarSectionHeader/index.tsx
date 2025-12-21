import styles from './SidebarSectionHeader.module.css';

type Props = {
  title: string;
};

export const SidebarSectionHeader = ({ title }: Props) => {
  return (
    <div className={styles.container}>
      <span className={styles.header}>{title}</span>
    </div>
  );
};
