import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  FilesystemDirectory
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
      Plugins.Filesystem.writeFile('secrets/text.txt', "This is a test", FilesystemDirectory.Documents, 'utf8')
    } catch(e) {
      console.error('Unable to write file (press mkdir first, silly)', e);
    }
    console.log('Wrote file');
  }

  async fileRead() {
    let contents = await Plugins.Filesystem.readFile('secrets/text.txt', FilesystemDirectory.Documents, 'utf8');
    console.log(contents);
  }

  async fileAppend() {
    await Plugins.Filesystem.appendFile('secrets/text.txt', "MORE TESTS", FilesystemDirectory.Documents, 'utf8');
    console.log('Appended');
  }

  async fileDelete() {
    await Plugins.Filesystem.deleteFile('secrets/text.txt', FilesystemDirectory.Documents);
    console.log('Deleted');
  }

  async mkdir() {
    try {
      let ret = await Plugins.Filesystem.mkdir('secrets', FilesystemDirectory.Documents, false);
      console.log('Made dir', ret);
    } catch(e) {
      console.error('Unable to make directory', e);
    }
  }

  async rmdir() {
    try {
      let ret = await Plugins.Filesystem.rmdir('secrets', FilesystemDirectory.Documents);
      console.log('Removed dir', ret);
    } catch(e) {
      console.error('Unable to remove directory', e);
    }
  }

  async readdir() {
    try {
      let ret = await Plugins.Filesystem.readdir('secrets', FilesystemDirectory.Documents);
      console.log('Read dir', ret);
    } catch(e) {
      console.error('Unable to read dir', e);
    }
  }

  async stat() {
    try {
      let ret = await Plugins.Filesystem.stat('secrets/text.txt', FilesystemDirectory.Documents);
      console.log('STAT', ret);
    } catch(e) {
      console.error('Unable to stat file', e);
    }
  }
}
