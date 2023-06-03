import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';

class SenderLoginDto {
  @ApiProperty()
  @IsString()
  public githubId: string;
}
class SenderDto {
  @ApiProperty({ type: SenderLoginDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SenderLoginDto)
  public login: SenderLoginDto;
}

export class CreateActivityWebhookDto {
  @ApiProperty({ type: SenderDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SenderDto)
  public sender: SenderDto;
}
