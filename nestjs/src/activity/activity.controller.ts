import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, CurrentRequest } from 'src/auth';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from 'src/config';
import { ActivityDto } from './dto/activity.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateActivityWebhookDto } from './dto/create-activity-webhook.dto';

@Controller('activity')
@ApiTags('activity')
export class ActivityController {
  constructor(private userService: UsersService, private config: ConfigService) {}

  @Get('/')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'getActivity' })
  @ApiOkResponse({ type: ActivityDto })
  public async getActivity(@Req() req: CurrentRequest): Promise<ActivityDto> {
    const {
      user: { id },
    } = req;
    const { lastActivityTime, isActive } = await this.userService.getUserByUserId(id);
    return { isActive, lastActivityTime };
  }

  @Post('/')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'createActivity' })
  @ApiOkResponse({ type: ActivityDto })
  @ApiBody({ type: CreateActivityDto })
  public async createActivity(@Body() body: CreateActivityDto, @Req() req: CurrentRequest): Promise<ActivityDto> {
    const {
      user: { id },
    } = req;
    const user = await this.userService.getUserByUserId(id);
    const { isActive } = body;
    const now = Date.now();
    await this.userService.saveUser({ ...user, lastActivityTime: now, isActive });
    return { isActive, lastActivityTime: now };
  }

  @Post('/webhook')
  @ApiOperation({ operationId: 'createActivityWebhook' })
  @ApiOkResponse({ type: ActivityDto })
  @ApiBody({ type: CreateActivityWebhookDto })
  public async createActivityWebhook(
    @Body() body: CreateActivityWebhookDto,
    @Req() req: Request,
  ): Promise<ActivityDto> {
    const signature = req.headers['x-hub-signature'] as string;

    if (!signature) {
      throw new UnauthorizedException('x-hub-signature is missing');
    }

    const comparisonSignature = createComparisonSignature(body, this.config.auth.github.activityWebhookSecret);
    if (!compareSignatures(signature, comparisonSignature)) {
      throw new UnauthorizedException("Signatures didn't match");
    }

    const { sender } = body;
    if (!sender || !sender.login) {
      throw new BadRequestException();
    }

    const { githubId } = sender.login;
    const user = await this.userService.getByGithubId(githubId);
    if (!user) {
      throw new NotFoundException(`User with GitHub id ${githubId} not found`);
    }

    const now = Date.now();
    const isActive = true;
    await this.userService.saveUser({ ...user, lastActivityTime: now, isActive });
    return { isActive, lastActivityTime: now };
  }
}

function createComparisonSignature(body: any, secret: string) {
  const hmac = crypto.createHmac('sha1', secret);
  const selfSignature = hmac.update(JSON.stringify(body)).digest('hex');
  return `sha1=${selfSignature}`;
}

function compareSignatures(signature: string, comparisonSignature: string) {
  const source = Buffer.from(signature);
  const comparison = Buffer.from(comparisonSignature);
  return crypto.timingSafeEqual(source, comparison);
}
