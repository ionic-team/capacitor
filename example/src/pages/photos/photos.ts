import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Plugins, PhotosResult } from '@avocadojs/core';

/**
 * Generated class for the PhotosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-photos',
  templateUrl: 'photos.html',
})
export class PhotosPage {
  photos = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public sanitizer: DomSanitizer) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PhotosPage');
  }

  async loadAlbums() {
    var albums = await Plugins.Photos.getAlbums({
      loadShared: true
    });
    console.log('ALBUMS', albums);
  }

  async loadInFavorites() {
    var result = await Plugins.Photos.getAlbums();
    var favorites = result.albums.filter(album => album.name.toLowerCase() == 'favorites')[0];
    console.log('Found favs', favorites);
    if(!favorites) { return; }
    var photos = await Plugins.Photos.getPhotos({
      albumIdentifier: favorites.identifier
    });
    this.printPhotos(photos);
    this.photos = photos.photos.map(photo => {
      return {
        ...photo,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + photo.data)
      }
    })
  }

  async loadPhotos() {
    var photos = await Plugins.Photos.getPhotos();
    this.printPhotos(photos);
    this.photos = photos.photos.map(photo => {
      return {
        ...photo,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + photo.data)
      }
    })
  }

  printPhotos(photos) {
    for(let photo of this.photos) {
      console.log({
        identifier: photo.identifier,
        fullWidth: photo.fullWidth,
        fullHeight: photo.fullHeight,
        thumbnailWidth: photo.thumbnailWidth,
        thumbnailHeight: photo.thumbnailHeight,
        thumbnailBytes: photo.data.length
      });
    }
  }
}
