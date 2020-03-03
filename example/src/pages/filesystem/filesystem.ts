import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  FilesystemDirectory,
  FilesystemEncoding
} from '@capacitor/core';

/**
 * Generated class for the FilesystemPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filesystem',
  templateUrl: 'filesystem.html',
})
export class FilesystemPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilesystemPage');
  }

  async fileWrite() {
    try {
      const result = await Plugins.Filesystem.writeFile({
        path: 'secrets/text.txt',
        data: "This is a test",
        directory: FilesystemDirectory.Documents,
        encoding: FilesystemEncoding.UTF8
      });
      console.log('Wrote file', result);
    } catch(e) {
      console.error('Unable to write file (press mkdir first, silly)', e);
    }
  }

  async fileRead() {
    let contents = await Plugins.Filesystem.readFile({
      path: 'secrets/text.txt',
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8
    });
    console.log(contents);
  }

  async fileAppend() {
    await Plugins.Filesystem.appendFile({
      path: 'secrets/text.txt',
      data: "MORE TESTS",
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8
    });
    console.log('Appended');
  }

  async fileDelete() {
    await Plugins.Filesystem.deleteFile({
      path: 'secrets/text.txt',
      directory: FilesystemDirectory.Documents
    });
    console.log('Deleted');
  }

  async mkdir() {
    try {
      let ret = await Plugins.Filesystem.mkdir({
        path: 'secrets',
        directory: FilesystemDirectory.Documents,
        recursive: false
      });
      console.log('Made dir', ret);
    } catch(e) {
      console.error('Unable to make directory', e);
    }
  }

  async rmdir() {
    try {
      let ret = await Plugins.Filesystem.rmdir({
        path: 'secrets',
        directory: FilesystemDirectory.Documents
      });
      console.log('Removed dir', ret);
    } catch(e) {
      console.error('Unable to remove directory', e);
    }
  }

  async readdir() {
    try {
      let ret = await Plugins.Filesystem.readdir({
        path: 'secrets',
        directory: FilesystemDirectory.Documents
      });
      console.log('Read dir', ret);
    } catch(e) {
      console.error('Unable to read dir', e);
    }
  }

  async getUri() {
    try {
      let ret = await Plugins.Filesystem.getUri({
        path: 'text.txt',
        directory: FilesystemDirectory.Data
      });
      alert(ret.uri);
    } catch(e) {
      console.error('Unable to stat file', e);
    }
  }

  async stat() {
    try {
      let ret = await Plugins.Filesystem.stat({
        path: 'secrets/text.txt',
        directory: FilesystemDirectory.Documents
      });
      console.log('STAT', ret);
    } catch(e) {
      console.error('Unable to stat file', e);
    }
  }

  async directoryTest() {
    try {
      const result = await Plugins.Filesystem.writeFile({
        path: 'text.txt',
        data: "This is a test",
        directory: FilesystemDirectory.Data,
        encoding: FilesystemEncoding.UTF8
      });
      console.log('wrote file', result);
      let stat = await Plugins.Filesystem.stat({
        path: 'text.txt',
        directory: FilesystemDirectory.Data
      });
      let data = await Plugins.Filesystem.readFile({
        path: stat.uri
      });
      console.log('Stat 1', stat);
      console.log(data);
      /*
      await Plugins.Filesystem.writeFile({
        path: 'text.txt',
        data: "This is a test",
        directory: FilesystemDirectory.Data,
        encoding: FilesystemEncoding.UTF8
      });
      stat = await Plugins.Filesystem.stat({
        path: 'text.txt',
        directory: FilesystemDirectory.Data
      });
      console.log('Stat 2', stat);
      await Plugins.Filesystem.writeFile({
        path: 'text.txt',
        data: "This is a test",
        directory: FilesystemDirectory.Cache,
        encoding: FilesystemEncoding.UTF8
      });
      stat = await Plugins.Filesystem.stat({
        path: 'text.txt',
        directory: FilesystemDirectory.Cache
      });
      */
      console.log('Stat 3', stat);
    } catch(e) {
      console.error('Unable to write file (press mkdir first, silly)', e);
    }
    console.log('Wrote file');
  }

  // Helper function to run the provided promise-returning function on a single item or array of items
  async doAll(item, callback) {
    item = Array.isArray(item) ? item : [item];
    for (let i of item) {
      await callback(i);
    }
  }

  // Run stat on many paths
  statAll(paths) {
    return this.doAll(paths, path => Plugins.Filesystem.stat({path}));
  }

  // Create many files
  writeAll(paths) {
    return this.doAll(paths, path => Plugins.Filesystem.writeFile({
      path,
      data: path,
      encoding: FilesystemEncoding.UTF8,
    }));
  }

  // Delete many files
  deleteAll(paths) {
    return this.doAll(paths, path => Plugins.Filesystem.deleteFile({path}));
  }

  // Create many directories
  mkdirAll(paths) {
    return this.doAll(paths, path => Plugins.Filesystem.mkdir({
      path,
      recursive: true,
    }));
  }

  // Remove many directories
  rmdirAll(paths) {
    return this.doAll(paths, path => Plugins.Filesystem.rmdir({path}));
  }

  // Exercise the rename call
  async renameFileTest() {
    console.log('Rename a file into a directory');
    await this.writeAll('fa');
    await this.mkdirAll('da');
    await Plugins.Filesystem.rename({from: 'fa', to: 'da/fb'});
    await this.deleteAll('da/fb');
    await this.rmdirAll('da');
  }

  // Exercise the copy call
  async copyFileTest() {
    console.log('Copy a file into a directory');
    await this.writeAll('fa');
    await this.mkdirAll('da');
    await Plugins.Filesystem.copy({from: 'fa', to: 'da/fb'});
    await this.deleteAll(['fa', 'da/fb']);
    await this.rmdirAll('da');
  }

  async renameDirectoryTest() {
    console.log('Move a directory into and out of a directory');
    await this.mkdirAll(['da', 'db', 'db/dc']);
    await this.writeAll(['db/fa', 'db/dc/fb']);

    await Plugins.Filesystem.rename({from: 'db', to: 'da/db'});
    await this.statAll(['da/db', 'da/db/fa', 'da/db/dc', 'da/db/dc/fb']);
    await Plugins.Filesystem.rename({from: 'da/db', to: 'db'});
    await this.statAll(['da', 'db', 'db/dc', 'db/fa', 'db/dc/fb']);

    await this.deleteAll(['db/fa', 'db/dc/fb']);
    await this.rmdirAll(['da', 'db/dc', 'db']);
  }

  async copyDirectoryTest() {
    console.log('Copy a directory into and out of a directory');
    await this.mkdirAll(['da', 'db', 'db/dc']);
    await this.writeAll(['db/fa', 'db/dc/fb']);

    await Plugins.Filesystem.copy({from: 'db', to: 'da/db'});
    await this.statAll(['da/db', 'da/db/dc', 'da/db/fa', 'da/db/dc/fb']);
    await Plugins.Filesystem.copy({from: 'da/db', to: 'dc'});
    await this.statAll(['dc', 'dc/dc', 'dc/dc/fb', 'dc/fa']);

    await this.deleteAll(['da/db/dc/fb', 'da/db/fa', 'db/dc/fb', 'db/fa', 'dc/dc/fb', 'dc/fa']);
    await this.rmdirAll(['dc/dc', 'dc', 'db/dc', 'db', 'da/db/dc', 'da/db', 'da']);
  }
}
