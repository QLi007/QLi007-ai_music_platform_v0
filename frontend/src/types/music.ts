// 音乐作品接口
export interface IMusic {
  id: string;
  title: string;
  description?: string;
  creator: string;
  coverImage?: string;
  audioFile: string;
  duration: number;
  genre?: string;
  tags?: string[];
  isPublic: boolean;
  stats: {
    plays: number;
    likes: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 音乐创建请求接口
export interface ICreateMusicRequest {
  title: string;
  description?: string;
  coverImage?: File;
  audioFile: File;
  genre?: string;
  tags?: string[];
  isPublic?: boolean;
}

// 音乐更新请求接口
export interface IUpdateMusicRequest {
  title?: string;
  description?: string;
  coverImage?: File;
  genre?: string;
  tags?: string[];
  isPublic?: boolean;
}

// 音乐列表响应接口
export interface IMusicListResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    musics: IMusic[];
    total: number;
    page: number;
    limit: number;
  };
}

// 音乐详情响应接口
export interface IMusicDetailResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    music: IMusic;
  };
} 