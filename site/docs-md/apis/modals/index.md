# Modals

The Modals API provides methods for triggering native modal windows for alerts, confirmations, and input prompts, as
well as Action Sheets.

<plugin-api index="true" name="modals"></plugin-api>

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
```

## API

<plugin-api name="modals"></plugin-api>