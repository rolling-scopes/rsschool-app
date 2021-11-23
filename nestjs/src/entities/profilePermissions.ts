import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user';

export const defaultPublicVisibilitySettings = {
  all: false,
};

export const defaultPartialStudentVisibilitySettings = {
  student: false,
  all: false,
};

export const defaultContactsVisibilitySettings = {
  student: true,
  all: false,
};

export const defaultVisibilitySettings = {
  mentor: false,
  student: false,
  all: false,
};

export const defaultProfilePermissionsSettings: any = {
  isProfileVisible: defaultPublicVisibilitySettings,
  isAboutVisible: defaultVisibilitySettings,
  isEducationVisible: defaultVisibilitySettings,
  isEnglishVisible: defaultPartialStudentVisibilitySettings,
  isEmailVisible: defaultContactsVisibilitySettings,
  isTelegramVisible: defaultContactsVisibilitySettings,
  isSkypeVisible: defaultContactsVisibilitySettings,
  isPhoneVisible: defaultContactsVisibilitySettings,
  isContactsNotesVisible: defaultContactsVisibilitySettings,
  isLinkedInVisible: defaultVisibilitySettings,
  isPublicFeedbackVisible: defaultVisibilitySettings,
  isMentorStatsVisible: defaultVisibilitySettings,
  isStudentStatsVisible: defaultPartialStudentVisibilitySettings,
};

@Entity()
export class ProfilePermissions {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn()
  createdDate: number;

  @UpdateDateColumn()
  updatedDate: number;

  @Column({ unique: true })
  userId: number;

  @OneToOne(() => User, user => user.profilePermissions)
  user: User;

  @Column({ type: 'json', default: defaultPublicVisibilitySettings })
  isProfileVisible: any;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isAboutVisible: any;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isEducationVisible: any;

  @Column({ type: 'json', default: defaultPartialStudentVisibilitySettings })
  isEnglishVisible: any;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isEmailVisible: any;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isTelegramVisible: any;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isSkypeVisible: any;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isPhoneVisible: any;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isContactsNotesVisible: any;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isLinkedInVisible: any;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isPublicFeedbackVisible: any;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isMentorStatsVisible: any;

  @Column({ type: 'json', default: defaultPartialStudentVisibilitySettings })
  isStudentStatsVisible: any;
}
