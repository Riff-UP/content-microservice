import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertExperimentConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  variableName: string;

  @IsString()
  variableValue: string;

  @IsOptional()
  @IsString()
  description?: string;
}
