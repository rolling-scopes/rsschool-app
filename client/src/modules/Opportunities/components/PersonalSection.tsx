import { UserData } from 'common/models/cv';
import React, { Fragment } from 'react';
import { css } from 'styled-jsx/css';
import { getPersonalToRender } from '../data/getPersonalToRender';

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
      <div style={{ fontSize: 14, paddingTop: 24, paddingBottom: 12 }}>
        <span className="cv-section-header">Personal</span>
      </div>
      <div>
        {data.map(({ title, value }) => (
          <Fragment key={title}>
            <div className="skill">{title}</div>
            <div className="skill-value">{value}</div>
          </Fragment>
        ))}
      </div>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = css`
  .user :global(.anticon svg) {
    fill: #fff;
  }

  .skill {
    font-size: 12px;
    color: #eee;
    text-transform: uppercase;
  }

  .skill-value {
    padding-bottom: 16px;
    font-weight: bold;
    word-break: break-all;
  }
`;
