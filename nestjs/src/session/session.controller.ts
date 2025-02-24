import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CurrentRequest, DefaultGuard } from 'src/auth';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUserDto } from './dto/auth-user.dto';

@Controller('session')
@ApiTags('session')
@UseGuards(DefaultGuard)
export class SessionController {
  // constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ operationId: 'getSession' })
  @ApiOkResponse({ type: AuthUserDto })
  getSession(@Req() req: CurrentRequest) {
    return req.user;
  }
}
