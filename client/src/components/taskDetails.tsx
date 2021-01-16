import React from 'react';
import {
    Row,
    Col,
    Typography,
    Tooltip,
} from 'antd';
import { EventTypeColor, EventTypeToName } from 'components/Schedule/model';
import { 
    renderTag,
} from 'components/Table';
import { CourseTaskDetails } from 'services/course';

export function TaskDetails({taskData}: {taskData: CourseTaskDetails}) {
    const { Title, Text } = Typography;

    const {
        description,
        checker,
        descriptionUrl,
        githubPrRequired,
        githubRepoName,
        maxScore,
        name,
        scoreWeight,
        sourceGithubRepoUrl,
        studentEndDate,
        studentStartDate,
        taskOwner,
        type,
        useJury,
        verification,
    } = taskData as CourseTaskDetails;

    return (
        <>
            <div style={{
                margin: '20px auto',
                maxWidth: '1200px',
                padding: '20px 10px',
            }}>

                <Row justify="center" align="middle" gutter={[40, 8]}>
                    <Col>
                        <Title>{name}</Title>
                        {taskOwner?.name && <Typography>Owner: {taskOwner?.name}</Typography>}
                    </Col>
                </Row>

                <Row justify="center" align="middle" gutter={[40, 16]}>
                    {studentStartDate && <Col>
                        {renderTag(EventTypeToName[type] || type, EventTypeColor[type as keyof typeof EventTypeColor])}
                        {studentStartDate?.replace(/[a-z]/gi, " ").slice(0, -8)}
                    </Col>}
                    {studentEndDate && <Col>
                        {renderTag("deadline", EventTypeColor.deadline)}
                        {studentEndDate?.replace(/[a-z]/gi, " ").slice(0, -8)}
                    </Col>}
                </Row>

                {description && <Row justify="center" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Tooltip title="Description">
                            <Text strong>Description:</Text>
                        </Tooltip>
                    </Col>
                    <Col>
                        <Text strong>{description}</Text>
                    </Col>
                </Row>}

                <Row justify="center" align="middle" gutter={[16, 16]}>
                    {maxScore && <Col>
                        <Tooltip title="Score">
                            <Text strong>Max score: {maxScore}</Text>
                        </Tooltip>
                    </Col>}
                    {scoreWeight && <Col>
                        <Text strong>Score weight: {scoreWeight}</Text>
                    </Col>}
                    {checker && <Col>
                        <Text strong>Checker: {checker}</Text>
                    </Col>}
                    {githubPrRequired && <Col>
                        <Tooltip title="Git gub">
                            <Text strong>PR required {githubPrRequired}</Text>
                        </Tooltip>
                    </Col>}
                </Row>

                <Row justify="center" align="middle" gutter={[16, 16]}>
                    {useJury &&
                        <Col>
                            <Tooltip title="Verification">
                                <Text strong>Checked by the jury</Text>
                            </Tooltip>
                        </Col>}
                    {verification && <Col>
                        <Text strong>Verification: {verification}</Text>
                    </Col>}
                </Row>

                <Row justify="center" align="middle" gutter={[16, 16]}>
                    {githubRepoName &&
                        <Col>
                            <Tooltip title="Git gub">
                                <Text strong>{githubRepoName}</Text>
                            </Tooltip>
                        </Col>}
                    {descriptionUrl && <Col>
                        <Text strong><a href={descriptionUrl}>Description</a></Text>
                    </Col>}
                    {sourceGithubRepoUrl && <Col>
                        <Text strong><a href={sourceGithubRepoUrl}>Git source</a></Text>
                    </Col>}
                </Row>
            </div>
        </>
    );
}

export default TaskDetails;
