import { WebPlugin, ClipboardPlugin, ClipboardWrite, ClipboardReadResult } from "@capacitor/core";

const { clipboard , nativeImage } = require('electron');



export class ClipboardPluginElectron extends WebPlugin implements ClipboardPlugin {

  constructor() {
    super({
      name: 'Clipboard',
      platforms: ['electron']
    });
  }

  async write(options: ClipboardWrite): Promise<void> {

    return new Promise<void>((resolve) => {
        if (options.string !== undefined) {
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
        return resolve();
    });


  }

  async read(): Promise<ClipboardReadResult> {

    return new Promise<ClipboardReadResult>((resolve)=>{
        const availableFormats = clipboard.availableFormats();
        if (availableFormats.length > 0) {
            let format = availableFormats[availableFormats.length-1];
            if (format.includes("image")) {
                return resolve({"value": clipboard.readImage().toDataURL(), "type": format});
            } else {
                format = availableFormats[0];
                if (format === undefined) {
                    return resolve({"value": "", "type": "text/plain"});
                }
                else if(format === "text/plain"){
                    return resolve({"value": clipboard.readText(), "type": format});
                }
                else if (format === "text/html"){
                    return resolve({"value": clipboard.readHTML(), "type": format});
                }
            }
        } else {
            return resolve({"value": "", "type": "text/plain"});
        }
    });
  }  


}

const Clipboard = new ClipboardPluginElectron();

export { Clipboard };
