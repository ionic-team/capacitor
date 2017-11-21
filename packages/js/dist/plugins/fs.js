var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AvocadoPlugin, Plugin } from '../plugin';
export var FilesystemDirectory;
(function (FilesystemDirectory) {
    FilesystemDirectory["Application"] = "APPLICATION";
    FilesystemDirectory["Documents"] = "DOCUMENTS";
    FilesystemDirectory["Data"] = "DATA";
    FilesystemDirectory["Cache"] = "CACHE";
    FilesystemDirectory["External"] = "EXTERNAL";
    FilesystemDirectory["ExternalStorage"] = "EXTERNAL_STORAGE"; // Android only
})(FilesystemDirectory || (FilesystemDirectory = {}));
var Filesystem = /** @class */ (function (_super) {
    __extends(Filesystem, _super);
    function Filesystem() {
        return _super.call(this) || this;
    }
    Filesystem.prototype.writeFile = function (file, data, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('writeFile', {
            file: file,
            data: data,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.readFile = function (file, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('readFile', {
            file: file,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.mkdir = function (path, directory, createIntermediateDirectories) {
        if (createIntermediateDirectories === void 0) { createIntermediateDirectories = false; }
        return this.nativePromise('mkdir', {
            path: path,
            directory: directory,
            createIntermediateDirectories: createIntermediateDirectories
        });
    };
    Filesystem.prototype.rmdir = function (path, directory) {
        return this.nativePromise('rmdir', {
            path: path
        });
    };
    Filesystem = __decorate([
        AvocadoPlugin({
            name: 'Filesystem',
            id: 'com.avocadojs.plugin.fs'
        })
    ], Filesystem);
    return Filesystem;
}(Plugin));
export { Filesystem };
