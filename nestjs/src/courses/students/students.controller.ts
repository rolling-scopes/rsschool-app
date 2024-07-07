import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { StudentDto, UserStudentsDto, UserStudentsQueryDto } from './dto';
import { StudentsService } from './students.service';

@Controller('students')
@ApiTags('students')
@UseGuards(DefaultGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getUserStudents' })
  @ApiOkResponse({ type: UserStudentsDto })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, Role.Hirer])
  public async getUserStudents(@Query() query: UserStudentsQueryDto) {
    const usersWithoutStudents = await this.studentsService.findUserStudents(query);

    return new UserStudentsDto(usersWithoutStudents);
  }

  @Get(':studentId')
  @ApiOkResponse({ type: StudentDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getStudent' })
  public async getOne(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: CurrentRequest) {
    const hasAccess = await this.studentsService.canAccessStudent(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const data = await this.studentsService.getById(studentId);
    return new StudentDto(data);
  }
}
