export interface SearchData {
  id: string; // document.id | session.id(message.id???)
  name: string; // document.name | session.name
  content: string; // document.content | session.name / message.content
  type: SearchDataType;
  updatedAt: string; // year month
}

export enum SearchDataEnum {
  'document' = 'document',
  'session' = 'session',
}

export type SearchDataType = keyof typeof SearchDataEnum;
