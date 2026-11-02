import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin, Content, Inquiry, Media, Project } from "./entities";
import { AuthController, AuthService, JwtGuard } from "./auth";
import { ContentController, ContentService } from "./content";
import { ProjectsController, ProjectsService } from "./projects";
import { InquiriesController, InquiriesService } from "./inquiries";
import { Initial1700000000000 } from "./migrations/1700000000000-Initial";
import { Media1700000000001 } from "./migrations/1700000000001-Media";
import { ManagedController } from "./managed";
import { MediaController, MediaService } from "./media";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ secret: process.env.JWT_SECRET ?? "development-only-secret", signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? "1d" } }),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [Admin, Content, Project, Inquiry, Media],
      migrations: [Initial1700000000000, Media1700000000001],
      migrationsRun: true,
      synchronize: process.env.NODE_ENV !== "production",
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    }),
    TypeOrmModule.forFeature([Admin, Content, Project, Inquiry, Media])
  ],
  controllers: [AuthController, ContentController, ProjectsController, InquiriesController, MediaController, ManagedController],
  providers: [AuthService, JwtGuard, ContentService, ProjectsService, InquiriesService, MediaService]
})
export class AppModule {}
