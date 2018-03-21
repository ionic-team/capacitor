<plugin-platforms platforms="ios,android"></plugin-platforms>

# Status Bar

The StatusBar API Provides methods for configuring the sytle of the Status Bar, along with showing or hiding it.

<plugin-api index="true" name="status-bar"></plugin-api>

## iOS Note

This plugin requires "View controller-based status bar appearance" (`UIViewControllerBasedStatusBarAppearance`) set to `YES` in `Info.plist`. Read about [Configuring iOS](../../ios/configuration) for help.

## Example

```typescript
import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';

const { StatusBar } = Plugins;

export class StatusBarExample {
  isStatusBarLight = true

  changeStatusBar() {
    StatusBar.setStyle({
      style: this.isStatusBarLight ? StatusBarStyle.Dark : StatusBarStyle.Light
    }, () => {});
    this.isStatusBarLight = !this.isStatusBarLight;
  }

  hideStatusBar() {
    StatusBar.hide();
  }

  showStatusBar() {
    StatusBar.show();
  }
}
```

## API

<plugin-api name="status-bar"></plugin-api>