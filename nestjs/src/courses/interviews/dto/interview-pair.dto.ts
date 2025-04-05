import { InterviewStatus } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { PersonDto } from 'src/core/dto';

export class InterviewPairDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ nullable: true, type: Number })
  result: number | null;

  @IsNotEmpty()
  @IsEnum(InterviewStatus)
  @ApiProperty({
    enum: [InterviewStatus.Completed, InterviewStatus.NotCompleted],
    enumName: 'InterviewStatus',
  })
  status: InterviewStatus.Completed | InterviewStatus.NotCompleted;

  @IsNotEmpty()
  @ApiProperty()
  interviewer: PersonDto;

  @IsNotEmpty()
  @ApiProperty()
  student: PersonDto;
}
