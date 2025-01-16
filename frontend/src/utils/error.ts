import { message } from 'antd';
import { IApiError } from '../types';

// 处理 API 错误
export const handleApiError = (error: IApiError): void => {
  if (error.errors) {
    // 如果有具体的字段错误，显示第一个错误
    const firstError = Object.values(error.errors)[0][0];
    message.error(firstError);
  } else {
    // 显示通用错误消息
    message.error(error.message || '操作失败');
  }
};

// 处理表单错误
export const handleFormError = (error: IApiError): Record<string, string[]> => {
  if (error.errors) {
    return error.errors;
  }
  return {};
};

// 检查是否是 API 错误
export const isApiError = (error: any): error is IApiError => {
  return (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    'message' in error
  );
}; 