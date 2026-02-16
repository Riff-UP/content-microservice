import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    sql_user_id!: string

    @IsString()
    title!: string;

    @IsString()
    @IsOptional()
    description!: string;

    @IsString()
    @IsNotEmpty()
    event_date!: string;

    @IsString()
    @IsNotEmpty()
    location!: string;
}
