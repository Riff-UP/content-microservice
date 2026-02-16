import { IsNotEmpty, IsString } from "class-validator";

export class CreatePostReactionDto {
    @IsString()
    @IsNotEmpty()
    sql_user_id!: string

    @IsString()
    @IsNotEmpty()
    post_id!: string
}