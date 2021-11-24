import { IsNotEmpty, IsString } from 'class-validator';

export class DisciplineDto {
  @IsNotEmpty()
  id: number;
  @IsString()
  name: string;
  @IsNotEmpty()
  createdDate: string;
  @IsNotEmpty()
  updatedDate: string;
}
