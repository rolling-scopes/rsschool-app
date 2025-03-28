import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config';
import { CourseListener } from './course.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { Discipline } from '@entities/discipline';

@Module({
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Course, Discipline])],
  providers: [CourseListener],
})
export class ListenersModule {}
