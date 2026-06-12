import { AuditLog } from '@entities/auditLog';
import { ApiProperty } from '@nestjs/swagger';

export class AuditLogEntryDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public userId: number;

  @ApiProperty({ required: false, nullable: true })
  public userGithubId: string | null;

  @ApiProperty()
  public tokenId: string;

  @ApiProperty({ required: false, nullable: true })
  public tokenName: string | null;

  @ApiProperty()
  public action: string;

  @ApiProperty()
  public method: string;

  @ApiProperty()
  public path: string;

  @ApiProperty()
  public responseStatus: number;

  @ApiProperty()
  public durationMs: number;

  @ApiProperty({ required: false, nullable: true })
  public ip: string | null;

  @ApiProperty({ required: false, nullable: true })
  public userAgent: string | null;

  @ApiProperty({ required: false, nullable: true })
  public requestPayload: unknown;

  @ApiProperty()
  public createdAt: string;

  constructor(entry: AuditLog) {
    this.id = entry.id;
    this.userId = entry.userId;
    this.userGithubId = entry.user?.githubId ?? null;
    this.tokenId = entry.tokenId;
    this.tokenName = entry.token?.name ?? null;
    this.action = entry.action;
    this.method = entry.method;
    this.path = entry.path;
    this.responseStatus = entry.responseStatus;
    this.durationMs = entry.durationMs;
    this.ip = entry.ip;
    this.userAgent = entry.userAgent;
    this.requestPayload = entry.requestPayload;
    this.createdAt = entry.createdAt.toISOString();
  }
}
