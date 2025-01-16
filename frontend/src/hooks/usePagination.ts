import { useState, useCallback } from 'react';
import { IPaginationParams } from '../types';

interface UsePaginationProps {
  defaultPage?: number;
  defaultPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
}

export const usePagination = ({
  defaultPage = 1,
  defaultPageSize = 10,
  onChange,
}: UsePaginationProps = {}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 处理页码变化
  const handlePageChange = useCallback((page: number, size: number = pageSize) => {
    setCurrentPage(page);
    setPageSize(size);
    onChange?.(page, size);
  }, [pageSize, onChange]);

  // 重置分页
  const reset = useCallback(() => {
    setCurrentPage(defaultPage);
    setPageSize(defaultPageSize);
    onChange?.(defaultPage, defaultPageSize);
  }, [defaultPage, defaultPageSize, onChange]);

  // 获取分页参数
  const getPaginationParams = useCallback((): IPaginationParams => {
    return {
      page: currentPage,
      limit: pageSize,
    };
  }, [currentPage, pageSize]);

  // 分页配置
  const paginationProps = {
    current: currentPage,
    pageSize,
    onChange: handlePageChange,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
  };

  return {
    currentPage,
    pageSize,
    handlePageChange,
    reset,
    getPaginationParams,
    paginationProps,
  };
}; 