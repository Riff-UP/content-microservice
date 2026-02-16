import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema'
import { Model } from 'mongoose';

@Injectable()
export class PostsService {

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>
  ){}

  async create(createPostDto: CreatePostDto) {
    return await this.postModel.create(createPostDto)
  }

  async findAll() {
    return await this.postModel.find().exec()
  }

  async findOne(id: number) {
    const post = await this.postModel.findById(id).exec()

    if(!post){
      throw new Error(`Post with id ${id} not found`)
    }
    return post
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    return await this.postModel.findByIdAndUpdate(id, updatePostDto, {new: true}).exec()
  }

  async remove(id: number) {
    const deletedPost = await this.postModel.findByIdAndDelete(id).exec()

    if(!deletedPost){
      throw new Error(`Post with id ${id} not found`)
    }
    return deletedPost
  }
}
