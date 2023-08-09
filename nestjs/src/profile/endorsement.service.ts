import { Course } from '@entities/course';
import { Feedback, Mentor, Student, TaskInterviewResult, User } from '@entities/index';
import { Prompt } from '@entities/prompt';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OpenAIApi, Configuration } from 'openai';
import { Eta } from 'eta';
import { ConfigService } from 'src/config';

const eta = new Eta();

@Injectable()
export class EndorsementService {
  private openAI: OpenAIApi;

  private logger = new Logger(EndorsementService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TaskInterviewResult)
    private taskInterviewResultRepository: Repository<TaskInterviewResult>,
    private readonly configService: ConfigService,
  ) {
    this.openAI = new OpenAIApi(new Configuration(this.configService.openai));
  }

  public async getEndorsement(githubId: string): Promise<{ content: string; data: object } | null> {
    try {
      const prompt = await this.getEndorsementPrompt(githubId);
      if (!prompt) {
        return null;
      }
      this.logger.log(`Endorsement prompt found`);
      const result = await this.openAI.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt.text }],
        temperature: prompt.temperature ?? 0.5,
      });
      this.logger.log(`Open AI response received`, result);
      const content = result.data.choices[0]?.message?.content ?? '';
      return { content, data: prompt.data };
    } catch (error) {
      this.logger.error((error as Error).message, error);
      return null;
    }
  }

  async getEndorsementPrompt(githubId: string) {
    const user = await this.userRepository.findOne({ where: { githubId } });
    if (!user) {
      this.logger.warn(`User not found for githubId: ${githubId}`);
      return null;
    }

    const [prompt, mentors, feedbacks] = await Promise.all([
      this.promptRepository.findOne({ where: { type: 'endorsement' } }),
      this.mentorRepository.find({ where: { userId: user.id } }),
      this.feedbackRepository.find({ where: { toUserId: user.id } }),
    ]);

    if (!prompt?.text || mentors.length === 0) {
      this.logger.warn(`No prompt text of mentors found for githubId: ${githubId}`);
      return null;
    }

    const courses = await this.courseRepository.find({
      where: { id: In(mentors.map(m => m.courseId)) },
      relations: ['discipline'],
    });
    const mentorIds = mentors.map(m => m.id);
    const [studentsCount, interviewsCount] = await Promise.all([
      this.studentRepository.count({ where: { mentorId: In(mentorIds) } }),
      this.taskInterviewResultRepository.count({ where: { mentorId: In(mentorIds) } }),
    ]);

    const data = {
      user,
      courses,
      mentors,
      studentsCount,
      interviewsCount,
      feedbacks,
    };
    return { text: eta.renderString(prompt.text, data), temperature: prompt.temperature, data };
  }
}
