import { DiscordServer } from '@entities/discordServer';
import { ApiProperty } from '@nestjs/swagger';

export class DiscordServerDto {
  constructor(discordServer: DiscordServer) {
    this.id = discordServer.id;
    this.createdDate = discordServer.createdDate;
    this.updatedDate = discordServer.updatedDate;
    this.name = discordServer.name;
    this.gratitudeUrl = discordServer.gratitudeUrl;
    this.mentorsChatUrl = discordServer.mentorsChatUrl;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdDate: number;

  @ApiProperty()
  updatedDate: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  gratitudeUrl: string;

  @ApiProperty({ nullable: true, type: String })
  mentorsChatUrl: string | null;
}
