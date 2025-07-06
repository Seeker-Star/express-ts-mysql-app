// 用户相关类型定义
export interface User {
  id?: number;
  name: string;
  address: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthUser {
  id?: number;
  username: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserRequest {
  name?: string;
  address?: string;
}

export interface RegisterUserRequest {
  username: string;
  password: string;
}

export interface LoginUserRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export interface JWTPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
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