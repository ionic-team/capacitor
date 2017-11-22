import { file } from 'mock-fs';
import { getIOSBaseProject } from '../platforms/ios/common';
import { resolve } from 'path';
import { IOS_BASE_PROJECT_PATH } from '../config';

describe('getIOSBaseProject', () => {
  it('should get the path of the xcode project', () => {
    const value = resolve(__dirname, '../', IOS_BASE_PROJECT_PATH);
    expect(getIOSBaseProject()).toEqual(value);
  });
});
