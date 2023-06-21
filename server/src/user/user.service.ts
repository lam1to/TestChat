import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ParamDto } from './param.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserId(idUser: ParamDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: +idUser.id,
      },
    });
    return {
      name: user.name,
      lastName: user.lastName,
      avatarPath: user.avatarPath,
    };
  }
}
