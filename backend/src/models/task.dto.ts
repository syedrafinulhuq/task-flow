import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Title of the task', example: 'Buy groceries', maxLength: 255 })
  title: string;

  @ApiPropertyOptional({ description: 'Optional longer description', example: 'Milk, eggs, bread, butter' })
  description?: string;

  @ApiPropertyOptional({ description: 'Task priority level', enum: ['low', 'medium', 'high'], default: 'medium', example: 'medium' })
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ description: 'Due date in YYYY-MM-DD format', example: '2025-12-31' })
  due_date?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Updated title', example: 'Buy groceries and cook dinner', maxLength: 255 })
  title?: string;

  @ApiPropertyOptional({ description: 'Updated description', example: 'Also pick up wine' })
  description?: string;

  @ApiPropertyOptional({ description: 'Task completion status', enum: ['pending', 'completed'], example: 'completed' })
  status?: 'pending' | 'completed';

  @ApiPropertyOptional({ description: 'Task priority level', enum: ['low', 'medium', 'high'], example: 'high' })
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ description: 'Due date in YYYY-MM-DD format', example: '2025-12-31' })
  due_date?: string;
}

export class TaskResponseDto {
  @ApiProperty({ example: 'b3d6f2a1-4c2e-4f1a-9b3d-1234567890ab' })
  id: string;

  @ApiProperty({ example: 'Buy groceries' })
  title: string;

  @ApiPropertyOptional({ example: 'Milk, eggs, bread' })
  description: string | null;

  @ApiProperty({ enum: ['pending', 'completed'], example: 'pending' })
  status: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'], example: 'medium' })
  priority: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  due_date: string | null;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  updated_at: string;
}
