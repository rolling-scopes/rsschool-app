import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseRole } from '@entities/session';
import { CourseTasksService } from '../course-tasks';

@Injectable()
export class FeedbackGuard implements CanActivate {
  constructor(
    private readonly courseCrossCheckService: CourseCrossCheckService,
    private readonly courseTasksService: CourseTasksService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { courseId, courseTaskId } = request.params;
    const studentId = request.user.courses[courseId]?.studentId;
    const isManager = request.user.isAdmin || request.user.courses[courseId]?.roles.includes(CourseRole.Manager);

    if (!studentId && !isManager) {
      throw new UnauthorizedException('Not a valid student for this course');
    }

    return this.validateTask(courseTaskId);
  }

  async validateTask(courseTaskId: number): Promise<boolean> {
    const courseTask = await this.courseTasksService.getById(courseTaskId);

    if (courseTask == null) {
      throw new BadRequestException('not valid student or course task');
    }

    if (!this.courseCrossCheckService.isCrossCheckTask(courseTask)) {
      throw new BadRequestException('not supported task');
    }

    return true;
  }
}
