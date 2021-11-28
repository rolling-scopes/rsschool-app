import { Mentor } from '@entities/mentor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    readonly mentorsRepository: Repository<Mentor>,
  ) {}

  public getByUserId(courseId: number, userId: number) {
    return this.mentorsRepository.findOne({
      where: { courseId, userId },
    });
  }
}
