import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CourseRole, CurrentRequest } from 'src/auth';
import { TeamService } from './team.service';

@Injectable()
export class TeamLeadOrCourseManagerGuard implements CanActivate {
  constructor(private teamService: TeamService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [request] = context.getArgs<[CurrentRequest]>();
    const courseId = Number(request.params.courseId);
    if (!courseId) {
      throw new UnauthorizedException();
    }
    const studentId = request.user.courses[courseId]?.studentId;
    const teamId = Number(request.params.id);

    const team = await this.teamService.findById(teamId);
    const isTeamLead = team.teamLeadId === studentId;
    const isManager = request.user.isAdmin || request.user.courses[courseId]?.roles.includes(CourseRole.Manager);
    if (!(isTeamLead || isManager)) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
