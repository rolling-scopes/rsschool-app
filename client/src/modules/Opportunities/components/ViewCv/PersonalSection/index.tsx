import { UserData } from 'modules/Opportunities/models';
import { Fragment } from 'react';
import { getPersonalToRender } from 'modules/Opportunities/data/getPersonalToRender';

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
            <div className="title">{title}</div>
            <div className="value">{value}</div>
          </Fragment>
        ))}
      </div>
      <style jsx>{`
        .title {
          font-size: 12px;
          color: #eee;
          text-transform: uppercase;
        }

        .value {
          padding-bottom: 16px;
          font-weight: bold;
          word-break: break-all;
        }

        @media print {
          .title,
          .value {
            color: #000;
          }
        }
      `}</style>
    </div>
  );
}
