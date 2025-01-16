import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile, UploadChangeParam } from 'antd/es/upload';

interface UseUploadProps {
  maxSize?: number; // 最大文件大小（字节）
  accept?: string; // 接受的文件类型
  maxCount?: number; // 最大文件数量
  onSuccess?: (file: File) => void;
  onError?: (error: Error) => void;
}

export const useUpload = ({
  maxSize = 5 * 1024 * 1024, // 默认 5MB
  accept = '*/*',
  maxCount = 1,
  onSuccess,
  onError,
}: UseUploadProps = {}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  // 检查文件大小
  const checkFileSize = useCallback((file: RcFile): boolean => {
    if (file.size > maxSize) {
      message.error(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`);
      return false;
    }
    return true;
  }, [maxSize]);

  // 检查文件类型
  const checkFileType = useCallback((file: RcFile): boolean => {
    if (accept === '*/*') return true;
    
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type || '';
    
    if (!acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      return type === fileType;
    })) {
      message.error(`只支持 ${accept} 格式的文件`);
      return false;
    }
    return true;
  }, [accept]);

  // 处理文件上传前的检查
  const beforeUpload = useCallback((file: RcFile): boolean => {
    if (!checkFileSize(file) || !checkFileType(file)) {
      return false;
    }
    return true;
  }, [checkFileSize, checkFileType]);

  // 处理文件变化
  const handleChange = useCallback(async (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList.slice(-maxCount));
    
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setLoading(false);
      const file = info.file.originFileObj;
      if (file) {
        onSuccess?.(file);
      }
    }
    
    if (info.file.status === 'error') {
      setLoading(false);
      const error = new Error(info.file.error?.message || '上传失败');
      onError?.(error);
    }
  }, [maxCount, onSuccess, onError]);

  // 移除文件
  const handleRemove = useCallback((file: UploadFile) => {
    setFileList(prev => prev.filter(item => item.uid !== file.uid));
  }, []);

  // 上传配置
  const uploadProps = {
    accept,
    maxCount,
    fileList,
    beforeUpload,
    onChange: handleChange,
    onRemove: handleRemove,
    multiple: maxCount > 1,
  };

  return {
    loading,
    fileList,
    uploadProps,
    setFileList,
  };
}; 