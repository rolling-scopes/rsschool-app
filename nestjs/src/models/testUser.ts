import { BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['github'])
export class TestUser {
  @PrimaryGeneratedColumn() id: number;

  @Column({ name: 'github', unique: true })
  @Index({ unique: true })
  github: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @BeforeInsert()
  beforeInsert?() {
    this.github = this.github.toLowerCase();
  }

  @BeforeUpdate()
  beforeUpdate?() {
    this.github = this.github.toLowerCase();
  }
}
