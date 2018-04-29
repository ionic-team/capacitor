import { WebPlugin, ClipboardPlugin,ClipboardWrite,ClipboardRead,ClipboardReadResult } from "@capacitor/core";

const { clipboard , nativeImage } = require('electron');



export class ClipboardPluginElectron extends WebPlugin implements ClipboardPlugin {

  constructor() {
    super({
      name: 'Clipboard',
      platforms: ['electron']
    });
  }

  async write(options: ClipboardWrite): Promise<void> {

    return new Promise<void>((resolve, reject) => {
        if (options.string) {
            clipboard.writeText(options.string);
        } else if(options.url){
            
            clipboard.write({
                text: options.url,
                bookmark: options.label || ''
            });

        } else if (options.image) {
            const dataURL = options.image;
            clipboard.write({
                image: nativeImage.createFromDataURL(dataURL)
            });            
        }
        return Promise.resolve();
    });


  }

  async read(_options: ClipboardRead): Promise<ClipboardReadResult> {

    return new Promise<ClipboardReadResult>((resolve, reject)=>{
        const availableFormats = clipboard.availableFormats();

        for(const format of availableFormats){
            if(format === "text/plain"){
                return Promise.resolve(clipboard.readText());
            }
            else if (format === "text/html"){
                return Promise.resolve(clipboard.readHTML());
            }
            else if (format === "image/png" || format === "image/jpeg" ){
                
                return Promise.resolve(clipboard.readImage().toDataURL());
            }
        }

        return Promise.reject('Unable to get data from clipboard');
    });
  }  


}

const Clipboard = new ClipboardPluginElectron();

export { Clipboard };
