import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../../auth';
import { StudentDto } from './dto';
import { StudentsService } from './students.service';

@Controller('students')
@ApiTags('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get(':studentId')
  @UseGuards(DefaultGuard)
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
    return data;
  }
}
