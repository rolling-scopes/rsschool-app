import { BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['github'])
export class TestUser {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ default: 'testUser' })
  provider: string;

  @Column({ name: 'github', unique: true })
  @Index({ unique: true })
  github: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ default: false })
  isAdmin: boolean;

  @BeforeInsert()
  beforeInsert?() {
    this.github = this.github.toLowerCase();
  }

  @BeforeUpdate()
  beforeUpdate?() {
    this.github = this.github.toLowerCase();
  }
}
