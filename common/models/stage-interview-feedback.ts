interface StageInterviewFeedback {
  common: {
    reason: 'haveITEducation' | 'doNotWorkInIT' | 'whatThisCourseAbout' | 'other' | null;
    reasonOther: string | null;
    whenStartCoding: number | null;
    schoolChallengesParticipaton: string | null;
    whereStudied: string | null;
    workExperience: string | null;
    otherAchievements: string | null;
    militaryService: 'served' | 'liable' | 'notLiable' | null;
  };
  skills: {
    [index: string]: any;
    htmlCss: {
      level: number | null;
    };
    dataStructures: {
      array: number | null;
      list: number | null;
      stack: number | null;
      queue: number | null;
      tree: number | null;
      hashTable: number | null;
      heap: number | null;
    };
    common: {
      binaryNumber: number | null;
      oop: number | null;
      bigONotation: number | null;
      sortingAndSearchAlgorithms: number | null;
    };
    comment: string | null;
  };
  programmingTask: {
    task: string | null;
    codeWritingLevel: number | null;
    resolved: number | null;
    comment: string | null;
  };
  resume: {
    verdict: StageInterviewFeedbackVerdict;
    comment: string | null;
  };
}

export type StageInterviewFeedbackVerdict = 'yes' | 'no' | 'noButGoodCandidate' | 'didNotDecideYet' | null;

export type EnglishLevel = 'a0' | 'a1' | 'a1+' | 'a2' | 'a2+' | 'b1' | 'b1+' | 'b2' | 'b2+' | 'c1' | 'c1+' | 'c2';

export interface StageInterviewFeedbackJson extends StageInterviewFeedback {
  english: {
    levelStudentOpinion: EnglishLevel | null;
    levelMentorOpinion: EnglishLevel | null;
    whereAndWhenLearned: string | null;
    comment: string | null;
  };
}

export interface StageInterviewFeedbackState extends StageInterviewFeedback {
  english: {
    levelStudentOpinion: number | null;
    levelMentorOpinion: number | null;
    whereAndWhenLearned: string | null;
    comment: string | null;
  };
}
