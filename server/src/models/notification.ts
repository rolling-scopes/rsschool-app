import { Entity, Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { NotificationChannelSettings } from '.';

export enum NotificationScope {
  general = 'general',
  mentor = 'mentor',
  student = 'student',
}

export type NotificationId =
  | 'mentorRegistrationApproval'
  | 'taskGrade'
  | 'courseCertificate'
  | 'courseScheduleChange'
  | 'taskDeadline'
  | 'interviewerAssigned';

@Entity()
export class Notification {
  @PrimaryColumn()
  id: NotificationId;

  @Column()
  @Index()
  name: string;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({ default: NotificationScope.general })
  @Index()
  scope: NotificationScope;

  @Column({ default: false })
  @Index()
  enabled: boolean;

  @OneToMany(_ => NotificationChannelSettings, channelSettings => channelSettings.notification, {
    cascade: true,
  })
  channels: NotificationChannelSettings[];
}
