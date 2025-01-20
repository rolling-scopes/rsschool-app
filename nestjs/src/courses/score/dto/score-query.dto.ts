import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export const orderByFieldMapping = {
  rank: 'student.rank',
  totalScore: 'student.totalScore',
  crossCheckScore: 'student.crossCheckScore',
  githubId: 'user.githubId',
  name: 'user.firstName',
  cityName: 'user.cityName',
  mentor: 'mu.githubId',
  totalScoreChangeDate: 'student.totalScoreChangeDate',
  repositoryLastActivityDate: 'student.repositoryLastActivityDate',
};

export type OrderDirection = 'asc' | 'desc';

export type OrderField = keyof typeof orderByFieldMapping;

export class ScoreQueryDto {
  @ApiProperty()
  @IsString()
  public activeOnly: 'true' | 'false';

  @ApiProperty({ enum: Object.keys(orderByFieldMapping) })
  @IsString()
  public orderBy: OrderField;

  @ApiProperty({ enum: ['asc', 'desc'] })
  @IsString()
  public orderDirection: OrderDirection;

  @ApiProperty()
  @IsString()
  public current: string;

  @ApiProperty()
  @IsString()
  public pageSize: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  githubId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  'mentor.githubId'?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cityName?: string;
}
