import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
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

  async getUri() {
    try {
      let ret = await Plugins.Filesystem.getUri({
        path: 'text.txt',
        directory: FilesystemDirectory.Application
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
      await Plugins.Filesystem.writeFile({
        path: 'text.txt',
        data: "This is a test",
        directory: FilesystemDirectory.Data,
        encoding: FilesystemEncoding.UTF8
      });
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

  async moveCopyTest() {
    // Helper function to run the provided promise-returning function on a single item or sequence of items
    const all = async (item, callback) => {
      item = Array.isArray(item) ? item : [item];
      for (let i of item) {
        await callback(i);
      }
    };

    const stat = async (path) => all(path, path => Plugins.Filesystem.stat({path}));
    const rename = async (from, to) => Plugins.Filesystem.rename({from, to});
    const copy = async (from, to) => Plugins.Filesystem.copy({from, to});
    const write = async (path) => all(path, path => Plugins.Filesystem.writeFile({
      path,
      data: path,
      encoding: FilesystemEncoding.UTF8,
    }));
    const _delete = async (path) => all(path, path => Plugins.Filesystem.deleteFile({path}));
    const mkdir = async (path) => all(path, path => Plugins.Filesystem.mkdir({
      path,
      createIntermediateDirectories: true,
    }));
    const rmdir = async (path) => all(path, path => Plugins.Filesystem.rmdir({path}));

    try {
      console.log('Check arguments');

      try {
        // @ts-ignore
        await rename('fa');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      try {
        // @ts-ignore
        await copy('fa');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      try {
        // @ts-ignore
        await rename(undefined, 'fa');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      try {
        // @ts-ignore
        await copy(undefined, 'fa');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      console.log('Rename/copy into a subdirectory of itself');
      await write('fa');

      try {
        await rename('fa', 'fc/fb');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      try {
        await copy('fa', 'fc/fb');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      await _delete('fa');

      console.log('Rename/copy a file to an empty location');
      await write('fa');
      await copy('fa', 'fy');
      await rename('fa', 'fx');
      try {
        await stat('fa');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }
      await stat(['fx', 'fy']);
      await _delete(['fx', 'fy']);

      console.log('Rename/copy a file to overwrite an existing file');
      await write(['fa', 'fb']);
      await copy('fa', 'fb');
      await rename('fa', 'fb');
      await _delete('fb');

      console.log('Rename/copy a file to itself');
      await write('fa');
      await copy('fa', 'fa');
      await rename('fa', 'fa');
      await _delete('fa');

      console.log('Rename/copy a file to overwrite a directory');
      await write('fa');
      await mkdir('da');

      try {
        await rename('fa', 'da');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      try {
        await copy('fa', 'da');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      await _delete('fa');
      await rmdir('da');

      console.log('Rename a file into a nonexistent directory');
      await write('fa');
      await mkdir('da');

      try {
        await rename('fa', 'da/db/fa');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      try {
        await copy('fa', 'da/db/fa');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      await _delete('fa');
      await rmdir('da');

      console.log('Rename a nonexistent file');
      try {
        await rename('fa', 'fx');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      console.log('Copy a nonexistent file');
      try {
        await copy('fa', 'fx');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      console.log('Rename/copy a file into a subdirectory that is a file');
      await write('fa');
      await mkdir('da');
      await write('da/fa');
      try {
        await rename('fa', 'da/fa/fb');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }

      try {
        await copy('fa', 'da/fa/fb');
        throw new Error("call should not succeed");
      } catch (e) {
        console.info(e.message);
      }
      await _delete(['da/fa', 'fa']);
      await rmdir('da');

      console.log('Rename/copy a file into a directory');
      await write('fa');
      await mkdir('da');
      await copy('fa', 'da/fb');
      await rename('fa', 'da/fa');
      await _delete(['da/fa', 'da/fb']);
      await rmdir('da');

      console.log('Rename/copy an empty directory into a directory');
      await mkdir(['da', 'db']);
      await copy('db', 'da/dc');
      await rename('db', 'da/db');
      await stat(['da/db', 'da/dc']);
      await rmdir(['da/dc', 'da/db', 'da']);

      console.log('Rename/copy a directory tree into a directory');
      await mkdir(['da', 'db', 'db/dc']);
      await write(['db/fa', 'db/dc/fb']);
      await copy('db', 'da/dc');
      await rename('db', 'da/db');
      await stat(['da/db', 'da/db/fa', 'da/db/dc', 'da/db/dc/fb', 'da/dc', 'da/dc/fa', 'da/dc/dc', 'da/dc/dc/fb']);
      await _delete(['da/dc/dc/fb', 'da/dc/fa', 'da/db/dc/fb', 'da/db/fa']);
      await rmdir(['da/dc/dc', 'da/dc', 'da/db/dc', 'da/db', 'da']);

      console.log('Rename/copy a directory tree out of a directory');
      await mkdir(['da', 'da/db', 'da/db/df', 'da/dc', 'da/dc/df']);
      await write(['da/db/fa', 'da/db/fb', 'da/db/df/fc']);
      await copy('da/db', 'dd');
      await rename('da/db', 'dc');
      await stat(['dd', 'dd/fa', 'dd/fb', 'dd/df/fc', 'dc', 'dc/fa', 'dc/fb', 'dc/df/fc', 'da']);
      await _delete(['dd/fa', 'dd/fb', 'dd/df/fc', 'dc/fa', 'dc/fb', 'dc/df/fc']);
      await rmdir(['dd/df', 'dd', 'dc/df', 'dc', 'da/dc/df', 'da/dc', 'da']);

      console.log('Rename preserves file mtime');
      await write('fa');
      let a = await Plugins.Filesystem.stat({path: "fa"});
      await rename('fa', 'fb');
      let b = await Plugins.Filesystem.stat({path: "fb"});
      if (a.mtime !== b.mtime) {
        throw new Error("mtime was not preserved");
      }
      await _delete('fb');

      console.log('Rename preserves directory mtime');
      await mkdir('da');
      a = await Plugins.Filesystem.stat({path: "da"});
      await mkdir('db');
      await rename('da', 'db/da');
      b = await Plugins.Filesystem.stat({path: "db/da"});
      if (a.mtime !== b.mtime) {
        throw new Error("mtime was not preserved");
      }
      await rmdir(['db/da', 'db']);
      console.info("No errors");
    } catch (e) {
      console.error("An unexpected error occurred", e.message);
    }
  }
}
