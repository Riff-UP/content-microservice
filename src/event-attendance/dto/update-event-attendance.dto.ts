import { PartialType } from '@nestjs/mapped-types';
import { CreateEventAttendanceDto } from './create-event-attendance.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEventAttendanceDto extends PartialType(
  CreateEventAttendanceDto,
) {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
