import { Injectable } from '@nestjs/common';
import pool from '../models/database';
import { CreateTaskDto, UpdateTaskDto } from '../models/task.dto';

@Injectable()
export class TasksService {
  async findAll(status?: string, priority?: string) {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (status && ['pending', 'completed'].includes(status)) {
      conditions.push(`status = $${idx++}`);
      params.push(status);
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      conditions.push(`priority = $${idx++}`);
      params.push(priority);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = `
      ORDER BY
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        created_at DESC
    `;

    const { rows } = await pool.query(
      `SELECT * FROM tasks ${where} ${orderBy}`,
      params
    );
    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async create(dto: CreateTaskDto) {
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, priority, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        dto.title.trim(),
        dto.description?.trim() || null,
        dto.priority || 'medium',
        dto.due_date || null,
      ]
    );
    return rows[0];
  }

  async update(id: string, dto: UpdateTaskDto) {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (dto.title !== undefined)       { fields.push(`title = $${idx++}`);       params.push(dto.title.trim()); }
    if (dto.description !== undefined) { fields.push(`description = $${idx++}`); params.push(dto.description?.trim() || null); }
    if (dto.status !== undefined)      { fields.push(`status = $${idx++}`);      params.push(dto.status); }
    if (dto.priority !== undefined)    { fields.push(`priority = $${idx++}`);    params.push(dto.priority); }
    if (dto.due_date !== undefined)    { fields.push(`due_date = $${idx++}`);    params.push(dto.due_date || null); }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows[0];
  }

  async toggle(id: string) {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET status     = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return rows[0];
  }

  async remove(id: string) {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  }
}
