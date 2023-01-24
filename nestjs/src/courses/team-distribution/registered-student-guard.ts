import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CourseRole, CurrentRequest } from 'src/auth';
import { StudentsService } from '../students';

@Injectable()
export class RegisteredStudentOrManagerGuard implements CanActivate {
  constructor(private studentsService: StudentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [request] = context.getArgs<[CurrentRequest]>();
    const courseId = Number(request.params.courseId);
    const studentId = request.user.courses[courseId]?.studentId;
    const distributionId = Number(request.params.id);
    if (!courseId || !studentId) {
      throw new UnauthorizedException();
    }
    const isManager = request.user.isAdmin || request.user.courses[courseId]?.roles.includes(CourseRole.Manager);
    if (isManager) {
      return true;
    }

    const student = await this.studentsService.getStudentWithTeamsAndDistribution(studentId);
    const distribution = student.teamDistribution.find(d => d.id === distributionId);
    const team = student.teams.find(t => t.teamDistributionId === distributionId);

    if (!team && !distribution) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
