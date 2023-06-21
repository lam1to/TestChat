import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { faker } from '@faker-js/faker';
import { hash, verify } from 'argon2';
import { RegDto } from './dto/reg.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: AuthDto) {
    const user = await this.validataUser(dto);
    const tokens = await this.jwtToken(user.id);
    return { user: this.returnUserFields(user), ...tokens };
  }

  async registration(dto: RegDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (oldUser) throw new BadRequestException('User already exists');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        lastName: dto.lastName,
        avatarPath: faker.image.avatar(),
        password: await hash(dto.password),
      },
    });
    const tokens = await this.jwtToken(user.id);
    return { user: this.returnUserFields(user), ...tokens };
  }
  async getNewTokens(refreshToken: string) {
    const res = await this.jwt.verifyAsync(refreshToken);
    if (!res) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.prisma.user.findUnique({
      where: {
        id: res.id,
      },
    });
    const tokens = await this.jwtToken(user.id);
    return { user: this.returnUserFields(user), ...tokens };
  }
  private async jwtToken(userId: number) {
    const data = { id: userId };
    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });
    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }
  private async validataUser(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new NotFoundException('User already exists');
    const isValid = await verify(user.password, dto.password);
    if (!isValid) throw new UnauthorizedException('Invalid password');
    return user;
  }
}
