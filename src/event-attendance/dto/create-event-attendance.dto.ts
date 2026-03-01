import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventAttendanceDto {
  @IsString()
  @IsNotEmpty()
  event_id!: string;

  @IsString()
  @IsNotEmpty()
  sql_user_id!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['confirmed', 'pending', 'cancelled'])
  status!: string;
}
