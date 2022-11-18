import { ApiProperty } from '@nestjs/swagger';

export class VisibilityDto {
  constructor(isHidden: boolean) {
    this.isHidden = isHidden;
  }

  @ApiProperty()
  public isHidden: boolean;
}
