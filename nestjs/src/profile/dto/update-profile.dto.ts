import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { ProfileInfoBaseDto } from './profile-info.dto';

export class UpdateProfileDto extends ProfileInfoBaseDto {
  @ApiProperty()
  @IsBoolean()
  isPermissionsSettingsChanged: boolean;

  @ApiProperty()
  @IsBoolean()
  isProfileSettingsChanged: boolean;
}
