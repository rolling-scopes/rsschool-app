import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorsService } from '.';
import { CurrentRequest, DefaultGuard } from '../../auth';
import { MentorStudentDto } from './dto/mentor-student.dto';

@Controller('mentors')
@ApiTags('mentors')
export class MentorsController {
  constructor(private mentorsService: MentorsService) {}

  @Get('/:mentorId/students')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'getMentorStudents' })
  @ApiOkResponse({ type: [MentorStudentDto] })
  @ApiBadRequestResponse()
  public async getMentorStudents(@Param('mentorId', ParseIntPipe) mentorId: number, @Req() req: CurrentRequest) {
    const hasAccess = await this.mentorsService.canAccessMentor(req.user, mentorId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const items = await this.mentorsService.getStudents(mentorId);
    return items.map(item => new MentorStudentDto(item));
  }
}
