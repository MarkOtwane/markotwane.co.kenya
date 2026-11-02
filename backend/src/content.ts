import { BadRequestException, Body, Controller, Injectable, Get, OnModuleInit, Param, Patch, Put, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Content, Project } from "./entities";
import { JwtGuard } from "./auth";
import { DEFAULT_CONTENT, DEFAULT_PROJECTS } from "./defaults";
import { RESOURCES } from "./managed";

type ContentValue = Record<string, unknown> | Record<string, unknown>[];

@Injectable()
export class ContentService implements OnModuleInit {
  constructor(
    @InjectRepository(Content) private readonly repository: Repository<Content>,
    @InjectRepository(Project) private readonly projects: Repository<Project>
  ) {}

  // Seed missing keys, and add fields introduced since a key was first saved, without overwriting edits.
  async onModuleInit() {
    const firstRun = !(await this.repository.findOneBy({ key: "site" }));
    for (const [key, defaults] of Object.entries(DEFAULT_CONTENT)) {
      const existing = await this.repository.findOneBy({ key });
      if (!existing) await this.repository.save(this.repository.create({ key, value: defaults }));
      else if (!Array.isArray(defaults) && !Array.isArray(existing.value)) {
        const merged = { ...defaults, ...existing.value };
        if (Object.keys(merged).length !== Object.keys(existing.value).length) await this.repository.save({ ...existing, value: merged });
      }
    }
    if (firstRun && (await this.projects.count()) === 0) await this.projects.save(DEFAULT_PROJECTS.map((project) => this.projects.create(project)));
  }

  all() { return this.repository.find({ where: { visible: true }, order: { sortOrder: "ASC" } }); }
  async get(key: string) { return this.repository.findOneBy({ key, visible: true }); }
  async save(key: string, value: ContentValue) {
    const defaults = DEFAULT_CONTENT[key];
    if (!defaults && !RESOURCES.includes(key)) throw new BadRequestException("Unsupported content key");
    if (defaults && Array.isArray(defaults) !== Array.isArray(value)) throw new BadRequestException(`"${key}" must be ${Array.isArray(defaults) ? "a list" : "an object"}`);
    const existing = await this.repository.findOneBy({ key });
    return this.repository.save(this.repository.create({ ...existing, key, value }));
  }
}

@Controller("content")
export class ContentController {
  constructor(private readonly service: ContentService) {}
  @Get() getAll() { return this.service.all(); }
  @Get(":key") get(@Param("key") key: string) { return this.service.get(key); }
  @Put(":key") @UseGuards(JwtGuard) put(@Param("key") key: string, @Body() value: ContentValue) { return this.service.save(key, value); }
  @Patch(":key") @UseGuards(JwtGuard) patch(@Param("key") key: string, @Body() value: ContentValue) { return this.service.save(key, value); }
}
