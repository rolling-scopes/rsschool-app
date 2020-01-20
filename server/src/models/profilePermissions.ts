import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user';

interface PublicVisibilitySettings {
  all: boolean;
}

interface VisibilitySettings extends PublicVisibilitySettings {
  mentor: boolean;
  student: boolean;
}

const defaultPublicVisibilitySettings = {
  all: false,
};

const defaultVisibilitySettings = {
  mentor: false,
  student: false,
  all: false,
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

  @Column({ type: 'json', default: defaultPublicVisibilitySettings })
  isAboutVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isEducationVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isEnglishVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isEmailVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isTelegramVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isSkypeVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isPhoneVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isContactsNotesVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isLinkedInVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isPublicFeedbackVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isMentorStatsVisible: VisibilitySettings;

  @Column({ type: 'json', default: defaultVisibilitySettings })
  isStudentStatsVisible: VisibilitySettings;
}
