import { PersonalAccessToken } from '@entities/personalAccessToken';
import { ApiProperty } from '@nestjs/swagger';
import { PersonalAccessTokenDto } from './personal-access-token.dto';

export class CreatedPersonalAccessTokenDto extends PersonalAccessTokenDto {
  @ApiProperty({ description: 'The full token. Shown only once; cannot be retrieved later.' })
  public token: string;

  constructor(record: PersonalAccessToken, token: string) {
    super(record);
    this.token = token;
  }
}
