import { Body, Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ParamDto } from './param.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserId(@Param() id: ParamDto) {
    return this.userService.getUserId(id);
  }
}
