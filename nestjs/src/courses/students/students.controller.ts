import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from '../../auth';
import { StudentsService } from './students.service';

@Controller('students')
@ApiTags('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get(':studentId')
  @UseGuards(DefaultGuard)
  public async getOne(@Param('studentId', ParseIntPipe) studentId: number) {
    const data = await this.studentsService.getById(studentId);
    return data;
  }
}
