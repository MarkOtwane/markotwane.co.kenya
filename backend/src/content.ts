import { Body, Controller, Injectable, Get, Param, Patch, Put, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Content } from "./entities";
import { JwtGuard } from "./auth";

@Injectable()
export class ContentService {
  constructor(@InjectRepository(Content) private readonly repository: Repository<Content>) {}
  all() { return this.repository.find({ where: { visible: true }, order: { sortOrder: "ASC" } }); }
  async get(key: string) { return this.repository.findOneBy({ key, visible: true }); }
  async save(key: string, value: Record<string, unknown>) {
    const existing = await this.repository.findOneBy({ key });
    return this.repository.save(this.repository.create({ ...existing, key, value }));
  }
}

@Controller("content")
export class ContentController {
  constructor(private readonly service: ContentService) {}
  @Get() getAll() { return this.service.all(); }
  @Get(":key") get(@Param("key") key: string) { return this.service.get(key); }
  @Put(":key") @UseGuards(JwtGuard) put(@Param("key") key: string, @Body() value: Record<string, unknown>) { return this.service.save(key, value); }
  @Patch(":key") @UseGuards(JwtGuard) patch(@Param("key") key: string, @Body() value: Record<string, unknown>) { return this.service.save(key, value); }
}
