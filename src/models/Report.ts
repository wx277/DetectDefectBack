import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  // 报表类型：daily-日报表，monthly-月报表
  @Column({
    type: 'enum',
    enum: ['daily', 'monthly']
  })
  report_type!: string;

  // 报表日期
  @Column('date')
  report_date!: Date;

  // 报表内容，使用JSON存储统计数据
  @Column('json')
  content!: {
    total_detections: number;
    defect_counts: {
      [key: string]: number;
    };
    success_rate: number;
    avg_confidence: number;
    hourly_stats?: {
      [hour: string]: number;
    };
    daily_stats?: {
      [day: string]: number;
    };
  };

  @CreateDateColumn()
  created_at!: Date;
} 