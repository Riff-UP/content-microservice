import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class TriggerSnapshotDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  executeWorkload?: boolean = false;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  iterations?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 200;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  resetStatsBeforeRun?: boolean = false;
}
