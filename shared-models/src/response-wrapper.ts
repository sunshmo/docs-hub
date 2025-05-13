import { ResponseData, ResponseStruct } from './response-data';

export class ResponseWrapper {
  static success(
    data: ResponseData = null,
    message = 'Success',
    success = true,
  ): ResponseStruct {
    return {
      success,
      message,
      data,
    };
  }

  static error(message = 'Error', success = false, data: ResponseData = null): ResponseStruct {
    return {
      success,
      message,
      data,
    };
  }
}
