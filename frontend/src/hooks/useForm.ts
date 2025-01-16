import { Form } from 'antd';
import { useState, useCallback } from 'react';
import { handleFormError, isApiError } from '../utils/error';

interface UseFormProps<T = any> {
  onSubmit: (values: T) => Promise<any>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  transform?: (values: any) => T;
}

export const useForm = <T = any>({
  onSubmit,
  onSuccess,
  onError,
  transform,
}: UseFormProps<T>) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理表单提交
  const handleSubmit = useCallback(async (values: any) => {
    setLoading(true);
    try {
      // 转换数据
      const data = transform ? transform(values) : values;
      await onSubmit(data);
      onSuccess?.();
    } catch (error) {
      if (isApiError(error)) {
        // 设置表单字段错误
        const fieldErrors = handleFormError(error);
        form.setFields(
          Object.entries(fieldErrors).map(([name, errors]) => ({
            name,
            errors: errors as string[],
          }))
        );
      }
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [form, onSubmit, onSuccess, onError, transform]);

  // 重置表单
  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  // 设置表单字段值
  const setFieldsValue = useCallback((values: any) => {
    form.setFieldsValue(values);
  }, [form]);

  // 获取表单字段值
  const getFieldsValue = useCallback(() => {
    return form.getFieldsValue();
  }, [form]);

  // 验证表单字段
  const validateFields = useCallback(async () => {
    try {
      const values = await form.validateFields();
      return transform ? transform(values) : values;
    } catch (error) {
      throw error;
    }
  }, [form, transform]);

  return {
    form,
    loading,
    handleSubmit,
    reset,
    setFieldsValue,
    getFieldsValue,
    validateFields,
  };
}; 