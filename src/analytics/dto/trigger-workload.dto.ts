import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class TriggerWorkloadDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  iterations?: number = 10;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  resetStats?: boolean = false;
}
