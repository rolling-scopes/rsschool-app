import { Entity, Column, CreateDateColumn, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class LoginState {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  @Index()
  createdDate: number;

  @Column({ type: 'simple-json' })
  data: LoginData;
}

export type LoginData = Partial<{
  redirectUrl: string;
}>;
