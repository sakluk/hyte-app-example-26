export interface User {
  user_id: number;
  username: string;
  email: string;
  password?: string;
  created_at: Date;
  user_level: 'regular' | 'admin';
}

export interface DiaryEntry {
  entry_id: number;
  user_id: number;
  entry_date: string;
  mood?: string;
  weight?: number;
  sleep_hours?: number;
  notes?: string;
  created_at?: Date;
}

export interface CustomError extends Error {
  status?: number;
  errors?: {field: string; message: string}[];
}
