import { ApiProperty } from '@nestjs/swagger';

export class StatusDto {
  constructor(expires: number) {
    this.expires = expires;
  }

  @ApiProperty()
  public expires: number;
}
