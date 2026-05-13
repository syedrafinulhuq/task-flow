import { Module } from '@nestjs/common';
import { TasksModule } from './routes/tasks.module';

@Module({
  imports: [TasksModule],
})
export class AppModule {}
