import { BadRequestException, Body, NotFoundException, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Content } from "./entities";
import { JwtGuard } from "./auth";

const RESOURCES = ["skills", "services", "experience", "education", "testimonials", "social-links", "settings", "seo"];

@Controller()
export class ManagedController {
  constructor(@InjectRepository(Content) private readonly content: Repository<Content>) {}

  @Get(":resource")
  async list(@Param("resource") resource: string) {
    const key = this.resourceKey(resource);
    const entry = await this.content.findOneBy({ key, visible: true });
    return Array.isArray(entry?.value) ? entry.value : [];
  }

  @Post(":resource")
  @UseGuards(JwtGuard)
  async create(@Param("resource") resource: string, @Body() value: Record<string, unknown>) {
    const key = this.resourceKey(resource);
    const values = await this.values(key);
    const record = { id: crypto.randomUUID(), ...value };
    await this.save(key, [...values, record]);
    return record;
  }

  @Patch(":resource/:id")
  @UseGuards(JwtGuard)
  async update(@Param("resource") resource: string, @Param("id") id: string, @Body() value: Record<string, unknown>) {
    const key = this.resourceKey(resource);
    const values = await this.values(key);
    const index = values.findIndex((item) => item.id === id);
    if (index < 0) throw new NotFoundException("Resource not found");
    values[index] = { ...values[index], ...value, id };
    await this.save(key, values);
    return values[index];
  }

  @Delete(":resource/:id")
  @UseGuards(JwtGuard)
  async remove(@Param("resource") resource: string, @Param("id") id: string) {
    const key = this.resourceKey(resource);
    const values = await this.values(key);
    await this.save(key, values.filter((item) => item.id !== id));
    return { success: true };
  }

  private resourceKey(resource: string) {
    if (!RESOURCES.includes(resource)) throw new BadRequestException("Unsupported resource");
    return resource;
  }
  private async values(key: string) {
    const entry = await this.content.findOneBy({ key });
    return Array.isArray(entry?.value) ? entry.value as Record<string, unknown>[] : [];
  }
  private async save(key: string, value: Record<string, unknown>[]) {
    const existing = await this.content.findOneBy({ key });
    await this.content.save(this.content.create({ ...existing, key, value }));
  }
}
