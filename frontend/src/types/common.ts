// 基础响应接口
export interface IBaseResponse {
  status: 'success' | 'error';
  message?: string;
}

// 分页参数接口
export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 分页响应接口
export interface IPaginatedResponse<T> extends IBaseResponse {
  data?: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 文件上传响应接口
export interface IUploadResponse extends IBaseResponse {
  data?: {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  };
}

// API 错误接口
export interface IApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
} 