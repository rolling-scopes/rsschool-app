import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class LoginState {
  @Column()
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdDate: number;

  @Column({ type: 'simple-json' })
  data: LoginData;
}

export type LoginData = Partial<{
  redirectUrl: string;
  telegramId: number;
}>;
