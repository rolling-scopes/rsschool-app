import { ApiProperty } from '@nestjs/swagger';

export enum Badge {
  Congratulations = 'Congratulations',
  ExpertHelp = 'Expert_help',
  GreatSpeaker = 'Great_speaker',
  GoodJob = 'Good_job',
  HelpingHand = 'Helping_hand',
  Hero = 'Hero',
  ThankYou = 'Thank_you',
  OutstandingWork = 'Outstanding_work',
  TopPerformer = 'Top_performer',
  JobOffer = 'Job_Offer',
  RSActivist = 'RS_activist',
  JuryTeam = 'Jury_Team',
  Mentor = 'Mentor',
  Contributor = 'Contributor',
  Coordinator = 'Coordinator',
  Thanks = 'Thanks',
}

export class BadgeDto {
  constructor(badge: { id: Badge; name: string }) {
    this.id = badge.id;
    this.name = badge.name;
  }

  @ApiProperty()
  public name: string;

  @ApiProperty({ type: Badge, enum: Badge, enumName: 'BadgeEnum' })
  public id: Badge;
}
