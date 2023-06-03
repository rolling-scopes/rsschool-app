import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EventType } from 'src/courses/course-events/dto/course-event.dto';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string;

  @IsNotEmpty()
  @IsEnum(EventType)
  @ApiProperty()
  public type: EventType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  public disciplineId: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  public descriptionUrl: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  public description: string;
}
