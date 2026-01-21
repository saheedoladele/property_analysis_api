import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  import { User } from './User.js';
  
  @Entity('payments')
  export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;
  
    @Column({ unique: true, type: 'varchar' })
    paypalOrderId: string;
  
    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;
  
    @Column({ length: 3, type: 'varchar' })
    currency: string;
  
    @Column({
      type: "enum",
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING"
    })
    status: "PENDING" | "COMPLETED" | "FAILED";

    @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
  
   
  }
  