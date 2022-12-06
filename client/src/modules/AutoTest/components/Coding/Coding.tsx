import { Row, Typography } from 'antd';
import React from 'react';
import { CourseTaskDetailedDto } from 'api';

type CodingProps = {
  courseTask: CourseTaskDetailedDto;
  githubId: string;
};

function Coding({ courseTask, githubId }: CodingProps) {
  const repoUrl = `https://github.com/${githubId}/${courseTask?.githubRepoName}`;

  return (
    <Row>
      <Typography.Paragraph>
        The system will run tests in the following repository and will update the score based on the result:
      </Typography.Paragraph>
      <Typography.Paragraph>
        <a href={repoUrl} target="_blank">
          {repoUrl}
        </a>
      </Typography.Paragraph>
    </Row>
  );
}

export default Coding;
