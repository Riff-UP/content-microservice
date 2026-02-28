import { IsObject, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class AuthTokenGeneratedDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  user!: UserDto;

  @IsString()
  token!: string;
}
