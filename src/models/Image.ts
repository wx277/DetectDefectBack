import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  filename!: string;

  @Column()
  path!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  status!: string;

  @CreateDateColumn()
  upload_time!: Date;

  @Column()
  user_id!: number;

  @Column({ nullable: true })
  task_id?: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Task, task => task.images)
  @JoinColumn({ name: 'task_id' })
  task!: Task;
} 