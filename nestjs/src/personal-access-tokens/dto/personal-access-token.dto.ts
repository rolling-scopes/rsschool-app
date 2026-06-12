import { PersonalAccessToken } from '@entities/personalAccessToken';
import { ApiProperty } from '@nestjs/swagger';

export class PersonalAccessTokenDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public userId: number;

  @ApiProperty()
  public name: string;

  @ApiProperty({ description: 'First 8 characters of the token, safe to display' })
  public prefix: string;

  @ApiProperty()
  public expiresAt: string;

  @ApiProperty({ required: false, nullable: true })
  public lastUsedAt: string | null;

  @ApiProperty({ required: false, nullable: true })
  public revokedAt: string | null;

  @ApiProperty()
  public createdAt: string;

  constructor(token: PersonalAccessToken) {
    this.id = token.id;
    this.userId = token.userId;
    this.name = token.name;
    this.prefix = token.prefix;
    this.expiresAt = token.expiresAt.toISOString();
    this.lastUsedAt = token.lastUsedAt ? token.lastUsedAt.toISOString() : null;
    this.revokedAt = token.revokedAt ? token.revokedAt.toISOString() : null;
    this.createdAt = token.createdAt.toISOString();
  }
}
