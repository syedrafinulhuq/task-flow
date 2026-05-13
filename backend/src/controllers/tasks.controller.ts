import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto } from '../models/task.dto';

@ApiTags('Tasks')
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks', description: 'Returns all tasks, optionally filtered by status and/or priority. Sorted by priority (high → medium → low) then creation date descending.' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high'] })
  @ApiResponse({ status: 200, description: 'List of tasks', type: [TaskResponseDto] })
  findAll(@Query('status') status?: string, @Query('priority') priority?: string) {
    return this.tasksService.findAll(status, priority);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'The task', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error — title is missing or invalid' })
  async create(@Body() dto: CreateTaskDto) {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new BadRequestException('Title is required and cannot be empty');
    }
    if (dto.title.trim().length > 255) {
      throw new BadRequestException('Title cannot exceed 255 characters');
    }
    if (dto.priority && !['low', 'medium', 'high'].includes(dto.priority)) {
      throw new BadRequestException('Priority must be low, medium, or high');
    }
    return this.tasksService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task', description: 'Update any combination of title, description, status, priority, or due_date.' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Updated task', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const task = await this.tasksService.findOne(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    if (dto.title !== undefined && dto.title.trim().length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }
    if (dto.status && !['pending', 'completed'].includes(dto.status)) {
      throw new BadRequestException('Status must be pending or completed');
    }
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle task status', description: 'Flips the task between pending and completed.' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task with toggled status', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async toggle(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return this.tasksService.toggle(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task permanently' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 204, description: 'Task deleted — no content returned' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    this.tasksService.remove(id);
  }
}
