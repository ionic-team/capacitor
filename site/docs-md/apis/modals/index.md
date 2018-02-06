# Modals

The Modals API provides methods for triggering native modal windows for alerts, confirmations, and input prompts, along
with Action Sheets and the native Share modal.

## Example

```javascript
import { Plugins } from '@capacitor/core';

const { Modals } = Plugins;

async showAlert() {
  let alertRet = await Modals.alert({
    title: 'Stop',
    message: 'this is an error'
  });
}

async showConfirm() {
  let confirmRet = await Modals.confirm({
    title: 'Confirm',
    message: 'Are you sure you\'d like to press the red button?'
  });
  console.log('Confirm ret', confirmRet);
}

async showPrompt() {
  let promptRet = await Modals.prompt({
    title: 'Hello',
    message: 'What\'s your name?'
  });
  console.log('Prompt ret', promptRet);
}

async showActions() {
  let promptRet = await Modals.showActions({
    title: 'Photo Options',
    message: 'Select an option to perform',
    options: [
      {
        title: 'Upload'
      },
      {
        title: 'Share'
      },
      {
        title: 'Remove',
        style: ActionSheetOptionStyle.Destructive
      }
    ]
  })
  console.log('You selected', promptRet);
}

async showSharing() {
  let shareRet = await Modals.showSharing({
    message: 'Really awesome thing you need to see right meow',
    url: 'http://ionicframework.com/',
    subject: 'See cool stuff'
  });
  console.log('Share return', shareRet);
}
```

## API

<plugin-api name="modals"></plugin-api>