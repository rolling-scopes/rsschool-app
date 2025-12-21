import { UserData } from 'modules/Opportunities/models';
import { Fragment } from 'react';
import { getPersonalToRender } from 'modules/Opportunities/data/getPersonalToRender';

import styles from './PersonalSection.module.css';

type Props = {
  user: UserData | null;
};

export function PersonalSection({ user }: Props) {
  if (user == null) {
    return null;
  }
  const data = getPersonalToRender(user);

  return (
    <div>
      <div>
        {data.map(({ title, value }) => (
          <Fragment key={title}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
