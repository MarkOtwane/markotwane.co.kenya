import "reflect-metadata";
import { DataSource } from "typeorm";
import { Admin, Content, Inquiry, Project } from "./entities";
import { Initial1700000000000 } from "./migrations/1700000000000-Initial";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Admin, Content, Project, Inquiry],
  migrations: [Initial1700000000000],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
