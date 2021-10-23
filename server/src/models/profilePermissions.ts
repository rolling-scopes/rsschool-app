import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user';
import { PublicVisibilitySettings, VisibilitySettings, ConfigurableProfilePermissions } from '../../../common/models/profile';

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

export const defaultProfilePermissionsSettings: ConfigurableProfilePermissions = {
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
  isProfileVisible: PublicVisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isAboutVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isEducationVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultPartialStudentVisibilitySettings })
  isEnglishVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isEmailVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isTelegramVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isSkypeVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isPhoneVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultContactsVisibilitySettings })
  isContactsNotesVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isLinkedInVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isPublicFeedbackVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isMentorStatsVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultPartialStudentVisibilitySettings })
  isStudentStatsVisible: VisibilitySettings;
}
