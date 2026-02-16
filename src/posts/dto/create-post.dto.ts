import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreatePostDto {

    @IsString()
    @IsNotEmpty()
    sql_user_id!: string

    @IsString()
    @IsEnum(['image, audio'])
    type!: string

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsUrl()
    @IsString()
    url!: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description!: string;
}

