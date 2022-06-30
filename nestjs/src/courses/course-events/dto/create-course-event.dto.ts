import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class Organizer {
  @ApiProperty()
  @IsNumber()
  id: number;
}

export class CreateCourseEventDto {
  @ApiProperty()
  @IsNumber()
  eventId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  special?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dateTime?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  place?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  organizer?: Organizer;

  @ApiProperty({ required: false })
  @IsOptional()
  organizerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  broadcastUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  coordinator?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  comment?: string;
}
