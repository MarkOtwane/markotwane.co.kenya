import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ unique: true }) email!: string;
  @Column() passwordHash!: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity("content")
export class Content {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ unique: true }) key!: string;
  @Column({ type: "jsonb", default: {} }) value!: Record<string, unknown> | Record<string, unknown>[];
  @Column({ default: true }) visible!: boolean;
  @Column({ default: 0 }) sortOrder!: number;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column() title!: string;
  @Column({ type: "text", default: "" }) description!: string;
  @Column({ default: "" }) image!: string;
  @Column({ default: "" }) githubUrl!: string;
  @Column({ default: "" }) liveUrl!: string;
  @Column("simple-array", { default: "" }) technologies!: string[];
  @Column({ default: true }) visible!: boolean;
  @Column({ default: 0 }) sortOrder!: number;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

@Entity("inquiries")
export class Inquiry {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column() name!: string;
  @Column() email!: string;
  @Column() subject!: string;
  @Column({ type: "text" }) message!: string;
  @Column({ default: "new" }) status!: "new" | "read" | "replied";
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
