import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RoleGuard, CurrentRequest } from '../../auth';
import { StudentsService } from '../students';
import { MentorStudentDto } from './dto/mentor-student.dto';

@Controller('mentors')
@ApiTags('mentors')
export class MentorsController {
  constructor(private studentsService: StudentsService) {}

  @Get('/:mentorId/students')
  @UseGuards(DefaultGuard, RoleGuard)
  @ApiOperation({ operationId: 'getStudents' })
  @ApiOkResponse({ type: [MentorStudentDto] })
  @ApiBadRequestResponse()
  public async getMentorStudents(@Param('mentorId', ParseIntPipe) mentorId: number) {
    const items = await this.studentsService.getByMentorId(mentorId);
    return items.map(item => new MentorStudentDto(item));
  }
}
