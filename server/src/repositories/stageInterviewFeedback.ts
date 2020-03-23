import { EntityRepository, AbstractRepository, getRepository } from 'typeorm';
import { StageInterview, StageInterviewFeedback } from 'models';

@EntityRepository(StageInterviewFeedback)
export class StageInterviewFeedbackRepository extends AbstractRepository<StageInterviewFeedback> {
  public findByStudent(courseId: number, githubId: string, mentorGithubId: string) {
    return getRepository(StageInterviewFeedback)
      .createQueryBuilder('sif')
      .innerJoin('sif.stageInterview', 'stageInterview')
      .innerJoin('stageInterview.mentor', 'mentor')
      .innerJoin('stageInterview.student', 'student')
      .innerJoin('mentor.user', 'mUser')
      .innerJoin('student.user', 'sUser')
      .where('stageInterview.courseId = :courseId', { courseId })
      .andWhere('sUser.githubId = :githubId', { githubId })
      .andWhere('mUser.githubId = :userId', { userId: mentorGithubId })
      .getOne();
  }

  public async create(
    stageInterviewId: number,
    data: { json: any; decision: string | null; isGoodCandidate: boolean | null; isCompleted: boolean },
  ) {
    const repository = getRepository(StageInterviewFeedback);
    const feedback = await repository.findOne({ where: { stageInterviewId } });
    const newFeedback = { stageInterviewId, json: data.json };

    if (feedback) {
      await repository.update(feedback.id, newFeedback);
    } else {
      await repository.insert(newFeedback);
    }

    const interview: any = { isCompleted: data.isCompleted };

    if (data.decision) {
      interview.decision = data.decision;
    }

    if (data.isGoodCandidate) {
      interview.isGoodCandidate = data.isGoodCandidate;
    }

    await getRepository(StageInterview).update(stageInterviewId, interview);
  }
}
