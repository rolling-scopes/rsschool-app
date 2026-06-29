import { StageInterview } from '@entities/stageInterview';
import { StageInterviewFeedbackJson } from '@common/models';
import { exportStageInterviewRating, getInterviewRatings } from './export-helpers';

const baseFeedback = (): StageInterviewFeedbackJson =>
  ({
    skills: {
      htmlCss: { level: 4 },
      common: { binaryNumber: 4, oop: 4, bigONotation: 4, sortingAndSearchAlgorithms: 4 },
      dataStructures: { array: 5, list: 5, stack: 5, queue: 5, tree: 5, hashTable: 5, heap: 5 },
    },
    programmingTask: { codeWritingLevel: 3 },
  }) as unknown as StageInterviewFeedbackJson;

describe('getInterviewRatings', () => {
  it('returns the resume score directly as rating when it is defined', () => {
    const feedback = { ...baseFeedback(), resume: { score: 77 } } as unknown as StageInterviewFeedbackJson;

    const result = getInterviewRatings(feedback);

    expect(result.rating).toBe(77);
    expect(result.htmlCss).toBe(4);
    expect(result.common).toBe(4);
    expect(result.dataStructures).toBe(5);
  });

  it('computes the averaged rating (x10) when there is no resume score and all four ratings are present', () => {
    const result = getInterviewRatings(baseFeedback());

    // ratings: htmlCss 4, common 4, dataStructures 5, codeWritingLevel 3 -> avg 4 -> *10 = 40
    expect(result.rating).toBe(40);
  });

  it('yields a zero rating when one of the four required ratings is missing', () => {
    const feedback = baseFeedback();
    feedback.programmingTask.codeWritingLevel = null;

    const result = getInterviewRatings(feedback);

    expect(result.rating).toBe(0);
  });

  it('defaults skill aggregates to NaN when skills are absent', () => {
    const feedback = { programmingTask: { codeWritingLevel: 3 } } as unknown as StageInterviewFeedbackJson;

    const result = getInterviewRatings(feedback);

    // empty common/dataStructures arrays -> 0/0 -> NaN, filtered out as falsy in rating computation
    expect(Number.isNaN(result.common)).toBe(true);
    expect(Number.isNaN(result.dataStructures)).toBe(true);
    expect(result.rating).toBe(0);
  });
});

describe('exportStageInterviewRating', () => {
  it('returns null when there are no completed interviews', () => {
    const interviews = [
      { isCompleted: false, stageInterviewFeedbacks: [], score: null },
    ] as unknown as StageInterview[];

    expect(exportStageInterviewRating(interviews)).toBeNull();
  });

  it('uses the precalculated score when present instead of recomputing from json', () => {
    const interviews = [
      {
        isCompleted: true,
        score: 88,
        stageInterviewFeedbacks: [{ updatedDate: '2024-01-01', json: '{}' }],
      },
    ] as unknown as StageInterview[];

    expect(exportStageInterviewRating(interviews)).toBe(88);
  });

  it('recomputes the rating from feedback json when score is nullish', () => {
    const interviews = [
      {
        isCompleted: true,
        score: null,
        stageInterviewFeedbacks: [{ updatedDate: '2024-01-01', json: JSON.stringify({ resume: { score: 55 } }) }],
      },
    ] as unknown as StageInterview[];

    expect(exportStageInterviewRating(interviews)).toBe(55);
  });

  it('picks the most recent feedback by updatedDate via the sort comparator', () => {
    const interviews = [
      {
        isCompleted: true,
        score: null,
        stageInterviewFeedbacks: [
          { updatedDate: '2024-01-01', json: JSON.stringify({ resume: { score: 10 } }) },
          { updatedDate: '2024-06-01', json: JSON.stringify({ resume: { score: 90 } }) },
        ],
      },
    ] as unknown as StageInterview[];

    // both feedbacks flow through the comparator; the newest (2024-06-01 -> 90) wins
    expect(exportStageInterviewRating(interviews)).toBe(90);
  });

  it('returns null when a completed interview has no feedbacks (no last interview)', () => {
    const interviews = [{ isCompleted: true, score: 50, stageInterviewFeedbacks: [] }] as unknown as StageInterview[];

    // completed interview but empty feedbacks -> mapped to [] -> lastInterview is undefined -> null
    expect(exportStageInterviewRating(interviews)).toBeNull();
  });

  it('keeps a zero precalculated score (does not coerce 0 to null)', () => {
    const interviews = [
      {
        isCompleted: true,
        score: 0,
        stageInterviewFeedbacks: [{ updatedDate: '2024-01-01', json: '{}' }],
      },
    ] as unknown as StageInterview[];

    expect(exportStageInterviewRating(interviews)).toBe(0);
  });
});
