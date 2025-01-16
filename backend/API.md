# AI Music Platform API 文档

## 基础信息

- 基础URL: `http://localhost:3000/api`
- 所有请求和响应均使用 JSON 格式
- 认证使用 Bearer Token 方式

## 认证相关接口

### 注册用户

```
POST /auth/register
```

请求体：
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

响应示例：
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "createdAt": "string"
    },
    "token": "string"
  }
}
```

### 用户登录

```
POST /auth/login
```

请求体：
```json
{
  "email": "string",
  "password": "string"
}
```

响应示例：
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "createdAt": "string"
    },
    "token": "string"
  }
}
```

### 获取当前用户信息

```
GET /auth/me
```

请求头：
```
Authorization: Bearer <token>
```

响应示例：
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "createdAt": "string"
    }
  }
}
```

### 用户登出

```
POST /auth/logout
```

请求头：
```
Authorization: Bearer <token>
```

响应示例：
```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

## 用户资料相关接口

### 获取用户资料

```
GET /profile/me
```

请求头：
```
Authorization: Bearer <token>
```

响应示例：
```json
{
  "status": "success",
  "data": {
    "profile": {
      "id": "string",
      "username": "string",
      "email": "string",
      "bio": "string",
      "avatar": "string",
      "coverImage": "string",
      "preferences": {
        "theme": "string",
        "language": "string"
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### 更新用户资料

```
PUT /profile/update
```

请求头：
```
Authorization: Bearer <token>
```

请求体：
```json
{
  "bio": "string",
  "preferences": {
    "theme": "string",
    "language": "string"
  }
}
```

响应示例：
```json
{
  "status": "success",
  "data": {
    "profile": {
      "id": "string",
      "username": "string",
      "email": "string",
      "bio": "string",
      "avatar": "string",
      "coverImage": "string",
      "preferences": {
        "theme": "string",
        "language": "string"
      },
      "updatedAt": "string"
    }
  }
}
```

### 上传头像

```
POST /profile/avatar
```

请求头：
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

请求体：
```
avatar: <file>
```

响应示例：
```json
{
  "status": "success",
  "data": {
    "avatar": "string"
  }
}
```

### 上传封面图片

```
POST /profile/cover
```

请求头：
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

请求体：
```
cover: <file>
```

响应示例：
```json
{
  "status": "success",
  "data": {
    "coverImage": "string"
  }
}
```

## 错误响应

所有错误响应的格式如下：

```json
{
  "status": "error",
  "message": "string"
}
```

常见错误状态码：
- 400: 请求参数错误
- 401: 未认证或认证失败
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 多语言支持

系统支持中文和英文两种语言，可以通过以下两种方式指定语言：

1. 在请求头中设置：
```
Accept-Language: zh-CN
```

2. 在用户偏好设置中指定：
```json
{
  "preferences": {
    "language": "zh"
  }
}
```

支持的语言代码：
- `en`: 英文
- `zh`: 中文 