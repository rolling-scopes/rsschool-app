import CommonCard from '@client/components/Profile/CommonCard';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { CSSProperties, ReactNode, useState } from 'react';
import { Empty, Flex, List, theme, Typography } from 'antd';
import { DecisionTag, getRating } from '@client/domain/interview';
import { Decision } from '@client/data/interviews/technical-screening';
import {
  DateWidget,
  ExpandButtonWidget,
  InterviewerWidget,
  IsGoodCandidateWidget,
  ScoreWidget,
} from '@client/components/Profile/ui/';
import { CoreJsInterviewFeedback, StageInterviewDetailedFeedback } from '@common/models';
import InterviewModal from '@client/components/Profile/InterviewModal';
import { Rating } from '@client/components/Rating';

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
  date,
  onClick,
  children,
  styles,
}: {
  keyIndex: number;
  interviewer: { name: string; githubId: string };
  date?: string;
  onClick: () => void;
  children: ReactNode;
  styles?: CSSProperties;
}) {
  return (
    <List.Item
      key={keyIndex}
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.5em',
      }}
    >
      <Flex justify="space-between" style={{ width: '100%' }}>
        <Flex vertical align="flex-start" gap="0.5em">
          {children}
        </Flex>
        <ExpandButtonWidget onClick={onClick} />
      </Flex>
      <Flex justify="space-between" align="center" wrap="wrap" gap="1em" style={{ width: '100%', ...styles }}>
        <InterviewerWidget interviewer={interviewer} vertical />
        <DateWidget date={date} />
      </Flex>
    </List.Item>
  );
}

function renderCoreJsInterviews({ cardData, setModalData }: CardRenderProps<CoreJsInterviewFeedback>) {
  const { token } = theme.useToken();

  if (!cardData || cardData.length === 0) return null;

  return (
    <List
      itemLayout="horizontal"
      dataSource={cardData}
      split={false}
      renderItem={({ courseName, locationName, interviews }, idx) =>
        interviews.map(({ score, interviewer, name, interviewDate }, interviewIndex) => (
          <InterviewCardListItem
            key={interviewIndex}
            keyIndex={interviewIndex}
            interviewer={interviewer}
            date={interviewDate}
            onClick={() => setModalData(interviewIndex, cardData[idx])}
            styles={{
              borderBottom: interviewIndex !== interviews.length - 1 ? `1px solid ${token.colorBorder}` : 'none',
              paddingBottom: '1.5em',
            }}
          >
            <Text strong>
              {courseName}
              {locationName && ` / ${locationName}`}
            </Text>
            <Text>{name}</Text>
            <ScoreWidget score={score} />
          </InterviewCardListItem>
        ))
      }
    />
  );
}

function renderPrescreeningInterviewCard({ cardData, setModalData }: CardRenderProps<StageInterviewDetailedFeedback>) {
  const { token } = theme.useToken();

  if (!cardData || cardData.length === 0) return null;

  return (
    <List
      itemLayout="horizontal"
      dataSource={cardData}
      split={false}
      renderItem={({ courseName, interviewer, score, maxScore, date, isGoodCandidate, version, decision }, idx) => (
        <InterviewCardListItem
          keyIndex={idx}
          interviewer={interviewer}
          date={date}
          onClick={() => setModalData(idx, cardData[idx])}
          styles={{ borderBottom: `1px solid ${token.colorBorder}`, paddingBottom: '1.5em' }}
        >
          <Text strong>{courseName}</Text>
          <Text>Pre-Screening Interview</Text>
          <DecisionTag decision={decision as Decision} />
          <Rating rating={getRating(score, maxScore, version)} />
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

  const hasPre = Array.isArray(props.prescreeningInterview) && props.prescreeningInterview.length > 0;
  const hasCore = Array.isArray(props.coreJsInterview) && props.coreJsInterview.length > 0;

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
        title="Interviews"
        icon={<QuestionCircleOutlined />}
        content={
          <>
            {!hasPre && !hasCore && <Empty />}

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
