import { RoleType } from './role-type';
import { Attachment } from './base';

export interface SessionMessage {
  role: RoleType
  content: string
  files?: Attachment[]
}
