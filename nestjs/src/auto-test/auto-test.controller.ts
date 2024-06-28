import { Controller, Get } from '@nestjs/common';
import { AutoTestService } from './auto-test.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole } from '@entities/session';
import { RequiredRoles, Role } from 'src/auth';
import { AutoTestTaskDto } from './dto/auto-test-task.dto';

@Controller('auto-test')
@ApiTags('auto-tests')
export class AutoTestController {
  constructor(private readonly service: AutoTestService) {}

  @Get()
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'getAllRSSchoolAppTests' })
  @ApiOkResponse({ type: [AutoTestTaskDto] })
  async getAllRSSchoolAppTests() {
    return (await this.service.getAll()).map(autoTest => new AutoTestTaskDto(autoTest));
  }
}
