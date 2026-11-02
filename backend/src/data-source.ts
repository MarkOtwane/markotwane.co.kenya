import "reflect-metadata";
import { DataSource } from "typeorm";
import { Admin, Content, Inquiry, Media, Project } from "./entities";
import { Initial1700000000000 } from "./migrations/1700000000000-Initial";
import { Media1700000000001 } from "./migrations/1700000000001-Media";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Admin, Content, Project, Inquiry, Media],
  migrations: [Initial1700000000000, Media1700000000001],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
