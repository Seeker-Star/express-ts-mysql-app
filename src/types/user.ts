// 用户相关类型定义
export interface User {
  id?: number;
  name: string;
  address: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserRequest {
  name?: string;
  address?: string;
}

export interface UserQueryResult {
  id: number;
  name: string;
  address: string;
}

export interface DatabaseResult {
  insertId: number;
  affectedRows: number;
}