import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { AutoTestService } from './auto-test.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole } from '@entities/session';
import { RequiredRoles, Role } from 'src/auth';
import { AutoTestTaskDto } from './dto/auto-test-task.dto';
import { MinimizedAutoTestTaskDto } from './dto/minimized-auto-test-task.dto';

@Controller('auto-test')
@ApiTags('auto-tests')
export class AutoTestController {
  constructor(private readonly service: AutoTestService) {}

  @Get()
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'getAllMinimizedRSSchoolAppTests' })
  @ApiOkResponse({ type: [MinimizedAutoTestTaskDto] })
  async getAllMinimizedRSSchoolAppTests() {
    return (await this.service.getAll()).map(autoTest => new MinimizedAutoTestTaskDto(autoTest));
  }

  @Get('/:id')
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'getRSSchoolAppTest' })
  @ApiOkResponse({ type: AutoTestTaskDto })
  async getAutoTestTask(@Param('id', ParseIntPipe) id: number) {
    const task = await this.service.getOne(id);
    if (!task) {
      throw new NotFoundException("Couldn't find task with id = " + id);
    }
    return new AutoTestTaskDto(task);
  }
}
