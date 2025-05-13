import { ReactNode } from 'react';

export type RenderCodeBlockButton = (
  rawCode: string,
  language: string,
) => ReactNode; // 渲染额外的按钮
