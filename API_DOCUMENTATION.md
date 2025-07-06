# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

## 用户认证相关接口

### 用户注册

注册新用户账号，用户名必须唯一，密码将被安全哈希处理后存储。

**接口地址**: `POST /register`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 限制 |
|--------|------|------|------|------|
| username | string | 是 | 用户名 | 3-50个字符，必须唯一 |
| password | string | 是 | 密码 | 至少6个字符 |

#### 请求示例

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "mypassword123"
  }'
```

```javascript
// JavaScript Fetch API
fetch('http://localhost:3000/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'mypassword123'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### 响应

**成功响应 (201 Created)**

```json
{
  "message": "用户注册成功",
  "userId": 1,
  "username": "testuser"
}
```

**失败响应**

| HTTP状态码 | 错误类型 | 响应示例 |
|-----------|----------|----------|
| 400 | 参数缺失 | `{"error": "用户名和密码不能为空"}` |
| 400 | 用户名长度无效 | `{"error": "用户名长度必须在3-50个字符之间"}` |
| 400 | 密码长度无效 | `{"error": "密码长度至少6个字符"}` |
| 409 | 用户名已存在 | `{"error": "用户名已存在"}` |
| 500 | 服务器错误 | `{"error": "服务器内部错误"}` |

### 用户登录

用户登录接口，验证用户名和密码，成功后返回JWT Token用于后续请求认证。

**接口地址**: `POST /login`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 限制 |
|--------|------|------|------|------|
| username | string | 是 | 用户名 | 已注册的用户名 |
| password | string | 是 | 密码 | 用户注册时的密码 |

#### 请求示例

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "mypassword123"
  }'
```

```javascript
// JavaScript Fetch API
fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'mypassword123'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### 响应

**成功响应 (200 OK)**

```json
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

**失败响应**

| HTTP状态码 | 错误类型 | 响应示例 |
|-----------|----------|----------|
| 400 | 参数缺失 | `{"error": "用户名和密码不能为空"}` |
| 401 | 认证失败 | `{"error": "用户名或密码错误"}` |
| 500 | 服务器错误 | `{"error": "服务器内部错误"}` |

## 用户管理接口（需要认证）

### 获取用户列表

获取所有已注册的普通用户信息（不包含认证用户）。

**接口地址**: `GET /users`

⚠️ **需要认证**: 此接口需要在请求头中包含有效的JWT Token

#### 请求示例

```bash
# 需要先登录获取token
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 响应

**成功响应 (200 OK)**

```json
[
  {
    "id": 1,
    "name": "Alice123",
    "address": "Address456"
  },
  {
    "id": 2,
    "name": "Alice789",
    "address": "Address321"
  }
]
```

### 添加随机用户

添加一个随机生成的用户（用于测试目的）。

**接口地址**: `GET /add-user`

⚠️ **需要认证**: 此接口需要在请求头中包含有效的JWT Token

#### 请求示例

```bash
# 需要先登录获取token
curl -X GET http://localhost:3000/add-user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 响应

**成功响应 (200 OK)**

```
插入用户，ID: 3, 姓名: Alice456, 地址: Address789
```

## 数据模型

### AuthUser（认证用户）

```typescript
interface AuthUser {
  id?: number;
  username: string;      // 用户名，3-50字符，唯一
  password: string;      // 哈希处理后的密码
  created_at?: Date;     // 创建时间
  updated_at?: Date;     // 更新时间
}
```

### RegisterUserRequest（注册请求）

```typescript
interface RegisterUserRequest {
  username: string;      // 用户名，3-50字符
  password: string;      // 密码，至少6字符
}
```

### User（普通用户）

```typescript
interface User {
  id?: number;
  name: string;          // 用户姓名
  address: string;       // 用户地址
  created_at?: Date;     // 创建时间
  updated_at?: Date;     // 更新时间
}
```

## 安全特性

### 密码安全

- **哈希算法**: bcrypt
- **Salt轮数**: 12轮
- **密码要求**: 最少6个字符
- **存储**: 仅存储哈希值，不存储明文密码

### 数据验证

- **用户名唯一性**: 数据库层面唯一约束
- **输入验证**: 服务端验证所有输入参数
- **错误处理**: 详细的错误信息和适当的HTTP状态码

## 错误码说明

| HTTP状态码 | 描述 | 常见原因 |
|-----------|------|----------|
| 200 | 成功 | 请求处理成功 |
| 201 | 创建成功 | 用户注册成功 |
| 400 | 请求错误 | 参数缺失或格式错误 |
| 409 | 资源冲突 | 用户名已存在 |
| 500 | 服务器错误 | 数据库连接失败或其他服务器问题 |

## 数据库表结构

### auth_users 表

```sql
CREATE TABLE auth_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### users 表

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 部署和环境配置

### 环境变量

```bash
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=your_database

# 服务器配置
PORT=3000
NODE_ENV=development

# JWT配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
```

### 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

## 测试示例

### 完整的用户注册流程测试

```bash
# 1. 正常注册
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "password": "password123"}'

# 2. 测试重复用户名
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "password": "password456"}'

# 3. 测试用户名太短
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "ab", "password": "password123"}'

# 4. 测试密码太短
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "validuser", "password": "123"}'

# 5. 测试缺少参数
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "validuser"}'
```

### JWT Token认证说明

所有需要认证的接口都必须在请求头中包含有效的JWT Token：

```bash
Authorization: Bearer <token>
```

**认证流程**：
1. 用户通过 `/login` 接口登录，获取JWT Token
2. 在后续请求中，将Token放在Authorization头中
3. 服务器验证Token的有效性
4. Token过期需要重新登录

**错误响应**：
- `401 Unauthorized`: 缺少Token或Token无效
- `403 Forbidden`: Token格式错误或已过期

### 完整的JWT认证流程测试

```bash
# 1. 注册用户
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# 2. 登录获取Token
TOKEN=$(curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}' \
  | jq -r '.token')

# 3. 使用Token访问受保护的接口
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"

# 4. 添加新用户（需要认证）
curl -X GET http://localhost:3000/add-user \
  -H "Authorization: Bearer $TOKEN"
```

## 待实现功能

以下功能可在后续版本中实现：

- [x] 用户登录接口
- [x] JWT Token 认证
- [ ] 密码重置功能
- [ ] 用户信息更新
- [ ] 用户注销
- [ ] Token刷新机制
- [ ] 密码强度验证增强
- [ ] 用户角色和权限管理
- [ ] 账号锁定机制
- [ ] 登录日志记录