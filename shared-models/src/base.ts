export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  telephone?: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: number;
  deletedAt?: string;
}

export interface Session {
  id: string;
  name: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: number;
  deletedAt?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'assistant' | 'user';
  sessionId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: number;
  deletedAt?: string;
}

export interface Crawler {
  id: string;
  url: string;
  messageId: string;
  createdAt?: string;
  deleted?: number;
  deletedAt?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  filepath: string;
  destName: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: number;
  deletedAt?: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  attachmentId: string;
}

export interface Document {
  id: string;
  name: string;
  content?: string;
  type: 'chat' | 'crawler' | 'write';
  userId: string;
  updateUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: number;
  deletedAt?: string;
  FULLTEXT?: any;
}

export interface ModelProvider {
  id: string;
  name: string;
  apiKey?: string;
  domain?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Model {
  id: string;
  name: string;
  config?: string;
  providerId: string;
  createdAt?: string;
  updatedAt?: string;
}
