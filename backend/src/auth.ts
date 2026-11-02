import { BadRequestException, Body, Controller, Get, Injectable, Post, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { IsEmail, IsString, MinLength } from "class-validator";
import { Admin } from "./entities";

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}

export class ChangePasswordDto {
  @IsString() currentPassword!: string;
  @IsString() @MinLength(8) newPassword!: string;
}

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Admin) private readonly admins: Repository<Admin>, private readonly jwt: JwtService) {}
  async login(dto: LoginDto) {
    let admin = await this.admins.findOneBy({ email: dto.email.toLowerCase() });
    if (!admin && dto.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
      admin = this.admins.create({ email: dto.email.toLowerCase(), passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "", 12) });
      await this.admins.save(admin);
    }
    if (!admin || !(await bcrypt.compare(dto.password, admin.passwordHash))) throw new UnauthorizedException("Invalid email or password");
    return { accessToken: this.jwt.sign({ sub: admin.id, email: admin.email }), admin: { id: admin.id, email: admin.email } };
  }
  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.admins.findOneBy({ id: adminId });
    if (!admin || !(await bcrypt.compare(dto.currentPassword, admin.passwordHash))) throw new BadRequestException("Current password is incorrect");
    admin.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.admins.save(admin);
    return { success: true };
  }
}

@Injectable()
export class JwtGuard {
  constructor(private readonly jwt: JwtService) {}
  canActivate(context: any) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw new UnauthorizedException("Authentication required");
    try { request.admin = this.jwt.verify(token); return true; } catch { throw new UnauthorizedException("Invalid or expired token"); }
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("login") login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Get("profile") @UseGuards(JwtGuard) profile(@Request() req: any) { return req.admin; }
  @Post("logout") logout() { return { success: true }; }
  @Post("password") @UseGuards(JwtGuard) changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) { return this.auth.changePassword(req.admin.sub, dto); }
}
