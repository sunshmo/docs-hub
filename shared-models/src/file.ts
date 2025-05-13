export enum FileType {
  'image' = 'image',
  'document' = 'document',
  'av' = 'av'
}

export class FileTypes {
  static [FileType.image] = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  static [FileType.document] = ['txt', 'markdown', 'md', 'pdf', 'html', 'xlsx', 'xls', 'docx', 'csv', 'pptx', 'ppt', 'xml', 'epub'];
  static [FileType.av] = ['mp3', 'm4a', 'wav', 'webm', 'amr', 'mp4', 'mov', 'mpeg', 'mpga'];
  static allowedTypes = FileTypes[FileType.image].concat(FileTypes[FileType.document])
    .concat(FileTypes[FileType.av])
    .map(e => `.${e}`)
}

export class FileTypeErrorMsg {
  static [FileType.image] = '图片';
  static [FileType.document] = '文档';
  static [FileType.av] = '媒体文件';
}

export function getFileMsg(type: FileType) {
  const types = FileTypes[type];
  return `仅支持 ${types.join('/')} ${FileTypeErrorMsg[type]}`
}
