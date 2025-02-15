import { ApiProperty, ApiResponse } from '@nestjs/swagger';

@ApiResponse({})
export class MentorInReviewTasksCountDto {
  constructor(count: number) {
    this.count = count;
  }

  @ApiProperty()
  count: number;
}
