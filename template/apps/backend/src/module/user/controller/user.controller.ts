import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PageDto } from '@hillbilly/nest/abstract';
import { RoleType } from '@constant/role-type.constant';
import { ApiPageOkResponse } from '@hillbilly/nest/decorator';
import { AuthUser } from '@hillbilly/nest/decorator';
import { Auth } from '@hillbilly/nest/decorator';
import { UUIDParam } from '@hillbilly/nest/decorator';
import { UseLanguageInterceptor } from '@hillbilly/nest/interceptor';
import { UserPermissions } from '../constant/user-permissions.constant';
import { UserFiltersDto } from '../dto/user-filters.dto';
import { TranslationService } from '@hillbilly/nest/package/translation';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateCurrentUserDto } from '../dto/update-current-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';
import { UsersPageOptionsDto } from '../dto/users-page-options.dto';
import { UserEntity } from '../entity/user.entity';
import { UserService } from '../service/user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly translationService: TranslationService,
  ) {}

  @Version('1')
  @Get()
  @Auth({
    permissions: [UserPermissions.VIEW],
  })
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get users list',
    type: UserDto,
  })
  async getUsers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
    @Query(new ValidationPipe({ transform: true }))
    filtersDto: UserFiltersDto,
    @AuthUser() user: UserEntity,
  ): Promise<PageDto<UserDto>> {
    const [items, pageMetaDto] = await this.userService.getUsers(
      pageOptionsDto,
      filtersDto,
      user,
    );

    return items.toPageDto(pageMetaDto);
  }

  @Version('1')
  @Post()
  @Auth({
    permissions: [UserPermissions.CREATE],
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Create user',
    type: UserDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return user.toDto();
  }

  @Version('1')
  @Get('admin')
  @Auth({})
  @HttpCode(HttpStatus.OK)
  @UseLanguageInterceptor()
  async admin(@AuthUser() user: UserEntity) {
    const translation = await this.translationService.translate(
      'admin.keywords.admin',
    );

    return {
      text: `${translation} ${user.name}`,
    };
  }

  @Version('1')
  @Get('me')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get current user profile',
    type: UserDto,
  })
  async getCurrentUser(@AuthUser() user: UserEntity): Promise<UserDto> {
    return user.toDto();
  }

  @Version('1')
  @Patch('me')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update current user profile',
    type: UserDto,
  })
  async updateCurrentUser(
    @AuthUser() user: UserEntity,
    @Body() updateCurrentUserDto: UpdateCurrentUserDto,
  ): Promise<UserDto> {
    const updatedUser = await this.userService.updateCurrentUser(
      user.id,
      updateCurrentUserDto,
    );
    return updatedUser.toDto();
  }

  @Version('1')
  @Get(':id')
  @Auth({
    permissions: [UserPermissions.VIEW],
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get user by id',
    type: UserDto,
  })
  async getUser(
    @UUIDParam('id', {
      description: 'User id',
      allowEmptyValue: false,
      allowReserved: false,
      example: '123e4567-e89b-12d3-a456-426655440000',
    })
    userId: Uuid,
  ): Promise<UserDto> {
    const user = await this.userService.getUser(userId);
    return user.toDto();
  }

  @Version('1')
  @Patch(':id')
  @Auth({
    permissions: [UserPermissions.UPDATE],
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update user',
    type: UserDto,
  })
  async updateUser(
    @UUIDParam('id', {
      description: 'User id',
      allowEmptyValue: false,
      allowReserved: false,
      example: '123e4567-e89b-12d3-a456-426655440000',
    })
    userId: Uuid,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(userId, updateUserDto);
    return user.toDto();
  }

  @Version('1')
  @Post(':id/block')
  @Auth({
    permissions: [UserPermissions.BLOCK],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Block user',
    type: undefined,
  })
  async blockUser(
    @UUIDParam('id', {
      description: 'User id',
      allowEmptyValue: false,
      allowReserved: false,
      example: '123e4567-e89b-12d3-a456-426655440000',
    })
    userId: Uuid,
  ) {
    await this.userService.blockUser(userId);
  }

  @Version('1')
  @Post(':id/unblock')
  @Auth({
    permissions: [UserPermissions.BLOCK],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Unblock user',
    type: undefined,
  })
  async unblockUser(
    @UUIDParam('id', {
      description: 'User id',
      allowEmptyValue: false,
      allowReserved: false,
      example: '123e4567-e89b-12d3-a456-426655440000',
    })
    userId: Uuid,
  ) {
    await this.userService.unblockUser(userId);
  }

  @Version('1')
  @Delete(':id')
  @Auth({
    permissions: [UserPermissions.DELETE],
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Delete user',
    type: undefined,
  })
  async deleteUser(
    @UUIDParam('id', {
      description: 'User id',
      allowEmptyValue: false,
      allowReserved: false,
      example: '123e4567-e89b-12d3-a456-426655440000',
    })
    id: Uuid,
  ) {
    await this.userService.deleteUser(id);
  }
}