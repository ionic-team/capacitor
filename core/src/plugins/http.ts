import { FilesystemDirectory } from './fs';
import { Plugin } from '../definitions';

export interface HttpPlugin extends Plugin {
  request(options: HttpOptions): Promise<HttpResponse>;
  setCookie(options: HttpSetCookieOptions): Promise<void>;
  getCookies(options: HttpGetCookiesOptions): Promise<HttpGetCookiesResult>;
  uploadFile(options: HttpUploadFileOptions): Promise<void>;
  downloadFile(options: HttpDownloadFileOptions): Promise<void>;
}

export interface HttpOptions {
  url: string;
  method?: string;
  params?: HttpParams;
  data?: any;
  headers?: HttpHeaders;
}

export interface HttpParams {
  [key:string]: string;
}

export interface HttpHeaders {
  [key:string]: string;
}

export interface HttpResponse {
  data: any;
  status: number;
  headers: HttpHeaders;
}

export interface HttpUploadFileOptions extends HttpOptions {
  filePath: string;
  fileDirectory?: FilesystemDirectory;
}

export interface HttpDownloadFileOptions extends HttpOptions {
  filePath: string;
  fileDirectory?: FilesystemDirectory;
}

export interface HttpUploadFileOptions {
  url: string;
  filePath: string;
}

export interface HttpCookie {
  key: string;
  value: string;
}

export interface HttpSetCookieOptions {
  url: string;
  key: string;
  value: string;
}

export interface HttpGetCookiesOptions {
  url: string;
}

export interface HttpGetCookiesResult {
  value: HttpCookie[];
}
