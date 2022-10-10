import { ApiProperty } from '@nestjs/swagger';

export class StatusDto {
  constructor(expires: number) {
    this.data = expires;
  }

  @ApiProperty()
  public data: number;
}
