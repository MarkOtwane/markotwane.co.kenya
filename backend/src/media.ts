import { BadRequestException, Controller, Delete, Get, Injectable, NotFoundException, Param, ParseUUIDPipe, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express";
import { Repository } from "typeorm";
import { Media } from "./entities";
import { JwtGuard } from "./auth";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

type UploadedImage = { originalname: string; mimetype: string; buffer: Buffer; size: number };

// Images are stored in Postgres so they survive redeploys on hosts with ephemeral disks (e.g. Render).
@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private readonly repository: Repository<Media>) {}
  all() { return this.repository.find({ order: { createdAt: "DESC" } }); }
  async create(file?: UploadedImage) {
    if (!file) throw new BadRequestException("No file uploaded");
    if (!IMAGE_TYPES.includes(file.mimetype)) throw new BadRequestException("Only JPEG, PNG, WebP, GIF or SVG images are allowed");
    const saved = await this.repository.save(this.repository.create({ filename: file.originalname, mimeType: file.mimetype, data: file.buffer, size: file.size }));
    return { id: saved.id, filename: saved.filename, mimeType: saved.mimeType, size: saved.size, url: `media/${saved.id}` };
  }
  async file(id: string) {
    const media = await this.repository.createQueryBuilder("media").addSelect("media.data").where("media.id = :id", { id }).getOne();
    if (!media) throw new NotFoundException("Image not found");
    return media;
  }
  async remove(id: string) { await this.repository.delete(id); return { success: true }; }
}

@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}
  @Get() @UseGuards(JwtGuard) all() { return this.service.all(); }
  @Post() @UseGuards(JwtGuard) @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_BYTES } }))
  upload(@UploadedFile() file: UploadedImage) { return this.service.create(file); }
  @Get(":id") async serve(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response) {
    const media = await this.service.file(id);
    // SVGs can carry scripts; sandbox them so an uploaded file can't run code on the API origin.
    res.set({ "Content-Type": media.mimeType, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" });
    res.send(media.data);
  }
  @Delete(":id") @UseGuards(JwtGuard) remove(@Param("id", ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
