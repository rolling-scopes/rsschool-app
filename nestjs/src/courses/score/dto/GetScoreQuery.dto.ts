import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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

export type OrderDirection = 'ASC' | 'DESC';

export type OrderField = keyof typeof orderByFieldMapping;

export class GetScoreQueryDto {
  @ApiProperty({ enum: Object.keys(orderByFieldMapping) })
  @IsString()
  public orderBy?: OrderField;

  @ApiProperty({ enum: ['asc', , 'desc'] })
  @IsString()
  public orderDirection?: 'asc' | 'desc';

  @ApiProperty()
  @IsString()
  public activeOnly?: 'true' | 'false';

  @ApiProperty()
  @IsString()
  public current: string;

  @ApiProperty()
  @IsString()
  public pageSize: string;
}
