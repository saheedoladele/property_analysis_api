import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Property } from "./Property.js";
import { Analysis } from "./Analysis.js";
import { Subscription } from "./Subscription.js";
import { Payment } from "./Payment.js";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, type: "varchar" })
  email!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  phone?: string;

  @Column({ name: "password_hash", type: "varchar" })
  passwordHash!: string;

  @Column({ name: "last_login_at", nullable: true, type: "timestamp" })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Property, (property) => property.user)
  properties!: Property[];

  @OneToMany(() => Analysis, (analysis) => analysis.user)
  analyses!: Analysis[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions!: Subscription[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Payment[];
}
