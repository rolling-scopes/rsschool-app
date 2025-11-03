import CommonCard from '@client/components/Profile/CommonCard';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ReactNode, useState } from 'react';
import { Empty, Flex, List, Space, Typography } from 'antd';
import { formatDate } from '@client/services/formatter';
import { DecisionTag, getRating } from '@client/domain/interview';
import { Decision } from '@client/data/interviews/technical-screening';
import { ExpandButtonWidget, InterviewerWidget, IsGoodCandidateWidget, Rating } from '@client/components/Profile/ui/';
import { CoreJsInterviewFeedback, StageInterviewDetailedFeedback } from '@common/models';
import InterviewModal from '@client/components/Profile/InterviewModal';

const { Text } = Typography;

type InterviewCardProps = {
  coreJsInterview?: CoreJsInterviewFeedback[];
  prescreeningInterview?: StageInterviewDetailedFeedback[];
};

type CardRenderProps<T> = {
  cardData?: T[];
  setModalData: (idx: number, data?: T) => void;
};

function InterviewCardListItem({
  keyIndex,
  interviewer,
  onClick,
  children,
}: {
  keyIndex: number;
  interviewer: { name: string; githubId: string };
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <List.Item style={{ display: 'flex', justifyContent: 'space-between' }} key={keyIndex}>
      <Flex vertical gap={'0.5em'}>
        {children}
        <InterviewerWidget interviewer={interviewer} />
      </Flex>
      <ExpandButtonWidget onClick={onClick} />
    </List.Item>
  );
}

function renderCoreJsInterviews({ cardData, setModalData }: CardRenderProps<CoreJsInterviewFeedback>) {
  if (!cardData || cardData.length === 0) return null;
  return (
    <List
      itemLayout="horizontal"
      dataSource={cardData}
      split={false}
      renderItem={({ courseName, locationName, interviews }, idx) =>
        interviews.map(({ score, interviewer, name, interviewDate }, interviewIndex) => (
          <InterviewCardListItem
            keyIndex={interviewIndex}
            interviewer={interviewer}
            onClick={() => setModalData(interviewIndex, cardData[idx])}
          >
            <Text strong>
              {courseName}
              {locationName && ` / ${locationName}`}
            </Text>
            <Text>{name}</Text>
            <Text>
              Score: <Text mark>{score}</Text>
            </Text>
            {interviewDate && <Text>Date: {formatDate(interviewDate)}</Text>}
          </InterviewCardListItem>
        ))
      }
    />
  );
}

function renderPrescreeningInterviewCard({ cardData, setModalData }: CardRenderProps<StageInterviewDetailedFeedback>) {
  if (!cardData) return null;
  return (
    <List
      itemLayout="horizontal"
      dataSource={cardData}
      split={false}
      renderItem={({ courseName, interviewer, score, maxScore, date, isGoodCandidate, version, decision }, idx) => (
        <InterviewCardListItem
          keyIndex={idx}
          interviewer={interviewer}
          onClick={() => setModalData(idx, cardData[idx])}
        >
          <Text strong>{courseName}</Text>
          <Text>Pre-Screening Interview</Text>
          <Space>
            <DecisionTag decision={decision as Decision} />
          </Space>
          <Rating rating={getRating(score, maxScore, version)} />
          <Text>Date: {formatDate(date)}</Text>
          <IsGoodCandidateWidget isGoodCandidate={isGoodCandidate} />
        </InterviewCardListItem>
      )}
    />
  );
}

type ModalProps =
  | {
      type: 'coreJs';
      interviewIdx: number;
      data?: CoreJsInterviewFeedback;
    }
  | {
      type: 'preScreening';
      interviewIdx: number;
      data?: StageInterviewDetailedFeedback;
    }
  | null;

export default function InterviewCard(props: InterviewCardProps) {
  const [modalContent, setModalContent] = useState<ModalProps>(null);

  function showModal(modalData: ModalProps) {
    setModalContent(modalData);
  }

  function hideModal() {
    setModalContent(null);
  }

  return (
    <>
      {modalContent?.type === 'coreJs' && modalContent.data && (
        <InterviewModal
          isVisible={!!modalContent}
          onHide={hideModal}
          coreJs={{ data: modalContent.data, idx: modalContent.interviewIdx }}
        />
      )}
      {modalContent?.type === 'preScreening' && modalContent.data && (
        <InterviewModal
          isVisible={!!modalContent}
          onHide={hideModal}
          prescreening={{ data: modalContent.data, idx: modalContent.interviewIdx }}
        />
      )}
      <CommonCard
        title="Inteviews"
        icon={<QuestionCircleOutlined />}
        content={
          <>
            {!props.prescreeningInterview && !props.coreJsInterview && <Empty />}

            {renderPrescreeningInterviewCard({
              cardData: props.prescreeningInterview,
              setModalData: (interviewIdx, data) => showModal({ type: 'preScreening', data, interviewIdx }),
            })}

            {renderCoreJsInterviews({
              cardData: props.coreJsInterview,
              setModalData: (interviewIdx, data) => showModal({ type: 'coreJs', data, interviewIdx }),
            })}
          </>
        }
      />
    </>
  );
}
