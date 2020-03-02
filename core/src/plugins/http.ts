import { FilesystemDirectory } from './fs';
import { Plugin } from '../definitions';

export interface HttpPlugin extends Plugin {
  request(options: HttpOptions): Promise<HttpResponse>;
  setCookie(options: HttpSetCookieOptions): Promise<void>;
  getCookies(options: HttpGetCookiesOptions): Promise<HttpGetCookiesResult>;
  deleteCookie(options: HttpDeleteCookieOptions): Promise<void>;
  clearCookies(options: HttpClearCookiesOptions): Promise<void>;
  uploadFile(options: HttpUploadFileOptions): Promise<HttpUploadFileResult>;
  downloadFile(options: HttpDownloadFileOptions): Promise<HttpDownloadFileResult>;
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

export interface HttpDownloadFileOptions extends HttpOptions {
  /**
   * The path the downloaded file should be moved to
   */
  filePath: string;
  /**
   * Optionally, the directory to put the file in
   * 
   * If this option is used, filePath can be a relative path rather than absolute
   */
  fileDirectory?: FilesystemDirectory;
}

export interface HttpUploadFileOptions extends HttpOptions {
  /**
   * The URL to upload the file to
   */
  url: string;
  /**
   * The field name to upload the file with
   */
  name: string;
  /**
   * The path to the file on disk to upload
   */
  filePath: string;
  /**
   * Optionally, the directory to look for the file in.
   * 
   * If this option is used, filePath can be a relative path rather than absolute
   */
  fileDirectory?: FilesystemDirectory;
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

export interface HttpDeleteCookieOptions {
  url: string;
  key: string;
}

export interface HttpClearCookiesOptions {
  url: string;
}

export interface HttpGetCookiesResult {
  value: HttpCookie[];
}

export interface HttpDownloadFileResult {
  path: string;
}

export interface HttpUploadFileResult {
}