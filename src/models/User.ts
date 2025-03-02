import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  // 用户角色：admin-管理员，operator-操作员
  @Column({
    type: 'enum',
    enum: ['admin', 'operator'],
    default: 'operator'
  })
  role!: string;

  // 用户状态：active-活跃，inactive-未激活，blocked-已封禁
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'blocked'],
    default: 'inactive'
  })
  status!: string;

  // 最后登录时间
  @Column({ type: 'timestamp', nullable: true })
  last_login!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
} 