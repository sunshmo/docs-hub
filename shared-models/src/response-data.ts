type IData = string | number | boolean | Symbol | undefined | null | object;

export type ResponseData = IData | IData[];

export interface ResponseStruct {
  success?: boolean;
  data?: ResponseData;
  message?: string;
}
