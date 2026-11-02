import { Body, Controller, Injectable, NotFoundException, ParseUUIDPipe, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsEmail, IsIn, IsString, MinLength } from "class-validator";
import { Repository } from "typeorm";
import { Inquiry } from "./entities";
import { JwtGuard } from "./auth";

export class InquiryDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(2) subject!: string;
  @IsString() @MinLength(10) message!: string;
}
export class InquiryStatusDto { @IsIn(["new", "read", "replied"]) status!: "new" | "read" | "replied"; }

@Injectable()
export class InquiriesService {
  constructor(@InjectRepository(Inquiry) private readonly repository: Repository<Inquiry>) {}
  create(dto: InquiryDto) { return this.repository.save(this.repository.create({ ...dto, email: dto.email.toLowerCase() })); }
  all() { return this.repository.find({ order: { createdAt: "DESC" } }); }
  async one(id: string) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException("Inquiry not found");
    return item;
  }
  async update(id: string, dto: InquiryStatusDto) { await this.repository.update(id, dto); return this.one(id); }
  async remove(id: string) { await this.repository.delete(id); return { success: true }; }
}

@Controller("inquiries")
export class InquiriesController {
  constructor(private readonly service: InquiriesService) {}
  @Post() create(@Body() dto: InquiryDto) { return this.service.create(dto); }
  @Get() @UseGuards(JwtGuard) all() { return this.service.all(); }
  @Get(":id") @UseGuards(JwtGuard) one(@Param("id", ParseUUIDPipe) id: string) { return this.service.one(id); }
  @Patch(":id") @UseGuards(JwtGuard) update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: InquiryStatusDto) { return this.service.update(id, dto); }
  @Delete(":id") @UseGuards(JwtGuard) remove(@Param("id", ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
