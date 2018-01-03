import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  FilesystemDirectory,
  FilesystemEncoding
} from '@avocadojs/core';

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

  fileWrite() {
    try {
      Plugins.Filesystem.writeFile({
        path: 'secrets/text.txt',
        data: "This is a test",
        directory: FilesystemDirectory.Documents,
        encoding: FilesystemEncoding.UTF8
      });
    } catch(e) {
      console.error('Unable to write file (press mkdir first, silly)', e);
    }
    console.log('Wrote file');
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
        createIntermediateDirectories: false
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
}
