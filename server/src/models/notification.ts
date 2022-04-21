import { Entity, Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { NotificationChannelSettings } from '.';

export enum NotificationType {
  event = 'event',
  message = 'message',
}

export type NotificationId =
  | 'mentorRegistrationApproval'
  | 'taskGrade'
  | 'courseCertificate'
  | 'courseScheduleChange'
  | 'taskDeadline'
  | 'interviewerAssigned'
  | 'emailConfirmation';

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

  @Column({ default: NotificationType.event })
  @Index()
  type: NotificationType;

  @Column({ default: false })
  @Index()
  enabled: boolean;

  @OneToMany(_ => NotificationChannelSettings, channelSettings => channelSettings.notification, {
    cascade: true,
  })
  channels: NotificationChannelSettings[];
}
