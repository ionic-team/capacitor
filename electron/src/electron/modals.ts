import { WebPlugin } from "@capacitor/core";

declare var require: any
const {dialog , getCurrentWindow} = require('electron').remote

import {
  ModalsPlugin,
  AlertOptions,
  PromptOptions,
  PromptResult,
  ConfirmOptions,
  ConfirmResult,
  ActionSheetOptions,
  ActionSheetResult
} from "@capacitor/core";

export class ModalsPluginElectron extends WebPlugin implements ModalsPlugin {
  resolve: any;
  constructor() {
    super({
      name: 'Modals',
      platforms: ['electron']
    });
  }
  async alert(options: AlertOptions): Promise<void> {
    const alert = (message: string, title: string = '') =>
    {    
        
        let buttons = [options.buttonTitle || 'OK']
        dialog.showMessageBox(getCurrentWindow(), {message, title, buttons});       
    }
        alert(options.message, options.title);
        return Promise.resolve();
  }
  async prompt(options: PromptOptions): Promise<PromptResult> {
    var self = this;
    return new Promise<PromptResult>( async (_) => {
    this.resolve = _;
    let modalController = document.querySelector('ion-modal-controller');
    if (!modalController) {
      modalController = document.createElement('ion-modal-controller');
      document.body.appendChild(modalController);
    }
    let inputValue = '';
    const elExists = !!customElements.get('modal-component');

    if(!elExists)
    {
      customElements.define('modal-component',class  ModalComp  extends  HTMLElement {

        async  connectedCallback() {
            this.innerHTML  =  `<label for="txtInput">${options.message}</label>
            <input id="txtInput" name="txtInput" />
            <button id="okBtn">OK</button>
            <button id="cancelBtn">Cancel</button>
            `;
            var  okBtn  =  document.querySelector("#okBtn");
            var  cancelBtn  =  document.querySelector("#cancelBtn");
            
            inputValue = "";
            okBtn.addEventListener('click',async () =>{
              console.log("Button clicked!");
              inputValue = (<HTMLInputElement>document.getElementById("txtInput")).value
              console.log(inputValue);
              await modalController.dismiss();
              return self.resolve({value: inputValue,cancelled: false});

            });
            cancelBtn.addEventListener('click',async () =>{
              console.log("Button clicked!");
              await modalController.dismiss();
              
              return self.resolve({value: inputValue,cancelled: false});

            });
            
      };
    });
  }
  
    await modalController.componentOnReady();
    const modalElement = await modalController.create({
        component:'modal-component'
    });
    await modalElement.present()
    
    });
  } 
  async confirm(options: ConfirmOptions): Promise<ConfirmResult> {

    const confirm = (message: string, title: string='') =>
    {
      let buttons = [options.okButtonTitle || 'OK' , options.cancelButtonTitle || 'Cancel']
      return !dialog.showMessageBox(getCurrentWindow(), {message, title, buttons});
    }
    const val = confirm(options.message,options.title);
    return Promise.resolve({
      value: val
    });
  }
  async showActions(options: ActionSheetOptions): Promise<ActionSheetResult> {
    return new Promise<ActionSheetResult>(async (resolve, _reject) => {
      var controller: any = document.querySelector('ion-action-sheet-controller');

      if (!controller) {
        controller = document.createElement('ion-action-sheet-controller');
        document.body.appendChild(controller);
      }

      await controller.componentOnReady();

      const items = options.options.map((o, i) => {
        return {
          text: o.title,
          role: o.style && o.style.toLowerCase() || '',
          icon: o.icon || '',
          handler: () => {
            resolve({
              index: i
            });
          }
        };
      });

      const actionSheetElement = await controller.create({
        title: options.title,
        buttons: items
      });

      await actionSheetElement.present();
    });
  }  


}

const Modals = new ModalsPluginElectron();

export { Modals };
