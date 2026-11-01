import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsOptional, IsString } from "class-validator";
import { Repository } from "typeorm";
import { Project } from "./entities";
import { JwtGuard } from "./auth";

export class ProjectDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() technologies?: string[];
}

@Controller("projects")
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}
  @Get() all() { return this.service.all(); }
  @Get(":id") one(@Param("id") id: string) { return this.service.one(id); }
  @Post() @UseGuards(JwtGuard) create(@Body() dto: ProjectDto) { return this.service.create(dto); }
  @Patch(":id") @UseGuards(JwtGuard) update(@Param("id") id: string, @Body() dto: Partial<ProjectDto>) { return this.service.update(id, dto); }
  @Delete(":id") @UseGuards(JwtGuard) remove(@Param("id") id: string) { return this.service.remove(id); }
}

export class ProjectsService {
  constructor(@InjectRepository(Project) private readonly repository: Repository<Project>) {}
  all() { return this.repository.find({ where: { visible: true }, order: { sortOrder: "ASC", createdAt: "DESC" } }); }
  one(id: string) { return this.repository.findOneByOrFail({ id }); }
  create(dto: ProjectDto) { return this.repository.save(this.repository.create(dto)); }
  async update(id: string, dto: Partial<ProjectDto>) { await this.repository.update(id, dto); return this.one(id); }
  async remove(id: string) { await this.repository.delete(id); return { success: true }; }
}
