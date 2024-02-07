import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { GeneralInfoBase, ProfileInfoBase } from './profile-info.dto';

class UpdateLocationInfoDto {
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsString()
  @IsOptional()
  cityName: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsString()
  @IsOptional()
  countryName: string | null;
}
class UpdateGeneralInfoDto extends GeneralInfoBase {
  @ApiProperty({ type: UpdateLocationInfoDto })
  location: UpdateLocationInfoDto;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  languages?: string[];
}

export class UpdateProfileDto extends ProfileInfoBase {
  @ApiProperty({ type: UpdateGeneralInfoDto })
  @ValidateNested()
  @Type(() => UpdateGeneralInfoDto)
  generalInfo: UpdateGeneralInfoDto;

  @ApiProperty()
  @IsBoolean()
  isPermissionsSettingsChanged: boolean;

  @ApiProperty()
  @IsBoolean()
  isProfileSettingsChanged: boolean;
}
