import { Course } from '@entities/course';
import { Feedback, Mentor, Student, TaskInterviewResult, User } from '@entities/index';
import { Prompt } from '@entities/prompt';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import OpenAI from 'openai';
import { compile } from 'handlebars';
import { ConfigService } from 'src/config';

@Injectable()
export class EndorsementService {
  private openAI: OpenAI;

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
    this.openAI = new OpenAI(this.configService.openai);
  }

  public async getEndorsement(githubId: string): Promise<{ content: string; data: object } | null> {
    try {
      const prompt = await this.getEndorsementPrompt(githubId);
      if (!prompt) {
        return null;
      }
      this.logger.log(`Endorsement prompt found`);
      const result = await this.openAI.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt.text }],
        temperature: prompt.temperature ?? 0.5,
      });
      this.logger.log(`Open AI response received`, result);
      const content = result.choices[0]?.message?.content ?? '';
      return { content, data: prompt.data };
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async getEndorsmentData(githubId: string) {
    const user = await this.userRepository.findOne({ where: { githubId } });
    if (!user) {
      throw new NotFoundException(`User with githubId ${githubId} not found`);
    }

    const [mentors, feedbacks] = await Promise.all([
      this.mentorRepository.find({ where: { userId: user.id } }),
      this.feedbackRepository.find({ where: { toUserId: user.id } }),
    ]);

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
    return data;
  }

  async getEndorsementPrompt(githubId: string) {
    const [prompt, data] = await Promise.all([
      this.promptRepository.findOne({ where: { type: 'endorsement' } }),
      this.getEndorsmentData(githubId),
    ]);

    if (!prompt?.text || data.mentors.length === 0) {
      this.logger.warn(`No prompt text or mentors found for githubId: ${githubId}`);
      return null;
    }

    return { text: compile(prompt.text)(data), temperature: prompt.temperature, data };
  }
}
