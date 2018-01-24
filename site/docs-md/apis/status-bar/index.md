# Status Bar

The StatusBar API Provides methods for configuring the sytle of the Status Bar, along with showing or hiding it.

## Example

```typescript
import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';

export class StatusBarExample {
  isStatusBarLight = true

  changeStatusBar() {
    Plugins.StatusBar.setStyle({
      style: this.isStatusBarLight ? StatusBarStyle.Dark : StatusBarStyle.Light
    }, () => {});
    this.isStatusBarLight = !this.isStatusBarLight;
  }

  hideStatusBar() {
    Plugins.StatusBar.hide();
  }

  showStatusBar() {
    Plugins.StatusBar.show();
  }
}
```

## API

<plugin-api name="status-bar"></plugin-api>