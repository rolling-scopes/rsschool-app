import { Controller } from '@nestjs/common';
import { CourseMentorsService } from './course-mentors.service';

@Controller('course-mentors')
export class CourseMentorsController {
  constructor(private readonly courseMentorsService: CourseMentorsService) {}
}
