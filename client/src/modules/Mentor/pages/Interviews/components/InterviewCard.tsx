import { Card } from 'antd';
import css from 'styled-jsx/css';
import { InterviewPeriod } from './InterviewPeriod';
import { useState } from 'react';
import { InterviewDetails } from './InterviewDetails';
import { InterviewDto } from 'api';

export function InteviewCard(props: { interview: InterviewDto }) {
  const { interview } = props;
  const { name, startDate, endDate, id, descriptionUrl, description } = interview;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      hoverable
      className={containerCss.className}
      title={name}
      extra={<InterviewPeriod startDate={startDate} endDate={endDate} />}
      key={id}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {description && <p>{description}</p>}
      <p>
        <a target="_blank" onClick={readMore} href={descriptionUrl}>
          Read more
        </a>
      </p>
      {isExpanded && <InterviewDetails interview={interview} />}
      {containerCss.styles}
    </Card>
  );
}

function readMore(e: React.MouseEvent) {
  e.stopPropagation();
}

const containerCss = css.resolve`
  div {
    margin-bottom: 16px;
  }

  div:last-child {
    margin-bottom: 0;
  }
`;
