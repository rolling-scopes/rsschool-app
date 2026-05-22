import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PersonalAccessToken } from './personalAccessToken';
import { User } from './user';

@Entity('audit_log')
@Index('IDX_audit_log_userId_createdAt', ['userId', 'createdAt'])
@Index('IDX_audit_log_tokenId_createdAt', ['tokenId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  tokenId: string;

  @ManyToOne(() => PersonalAccessToken)
  @JoinColumn({ name: 'tokenId' })
  token: PersonalAccessToken;

  @Column({ type: 'varchar', length: 120 })
  action: string;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 500 })
  path: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  resource: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  resourceId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  requestPayload: Record<string, unknown> | null;

  @Column({ type: 'smallint' })
  responseStatus: number;

  @Column({ type: 'integer' })
  durationMs: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
