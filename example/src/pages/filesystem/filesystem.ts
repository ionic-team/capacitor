import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Filesystem,
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
    let fs = new Filesystem()
    try {
      fs.writeFile('secrets/text.txt', "This is a test", FilesystemDirectory.Documents)
    } catch(e) {
      console.error('Unable to write file (press mkdir first, silly)', e);
    }
    console.log('Wrote file');
  }

  async fileRead() {
    let fs = new Filesystem()
    let contents = await fs.readFile('secrets/text.txt', FilesystemDirectory.Documents);
    console.log(contents);
  }

  async fileAppend() {
    let fs = new Filesystem()
    await fs.appendFile('secrets/text.txt', "MORE TESTS", FilesystemDirectory.Documents);
    console.log('Appended');
  }

  async fileDelete() {
    let fs = new Filesystem()
    await fs.deleteFile('secrets/text.txt', FilesystemDirectory.Documents);
    console.log('Deleted');
  }

  async mkdir() {
    let fs = new Filesystem()
    try {
      let ret = await fs.mkdir('secrets', FilesystemDirectory.Documents);
      console.log('Made dir', ret);
    } catch(e) {
      console.error('Unable to make directory', e);
    }
  }

  async rmdir() {
    let fs = new Filesystem()
    try {
      let ret = await fs.rmdir('secrets', FilesystemDirectory.Documents);
      console.log('Removed dir', ret);
    } catch(e) {
      console.error('Unable to remove directory', e);
    }
  }

  async readdir() {
    let fs = new Filesystem()
    try {
      let ret = await fs.readdir('secrets', FilesystemDirectory.Documents);
      console.log('Read dir', ret);
    } catch(e) {
      console.error('Unable to read dir', e);
    }
  }

  async stat() {
    let fs = new Filesystem()
    try {
      let ret = await fs.stat('secrets/text.txt', FilesystemDirectory.Documents);
      console.log('STAT', ret);
    } catch(e) {
      console.error('Unable to stat file', e);
    }
  }
}
