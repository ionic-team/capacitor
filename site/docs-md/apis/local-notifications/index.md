---
title: Local Notifications
description: Local Notifications API
url: /docs/apis/local-notifications
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Local Notifications

The Local Notification API provides a way to schedule "local" notifications - notifications that are scheduled and delivered on the device as opposed to "push" notifications sent from a server.

Local Notifications are great for reminding the user about a change in the app since they last visited, providing reminder features, and delivering offline information with the app being in the foreground.

<plugin-api index="true" name="local-notifications"></plugin-api>

## Example

```typescript
import { Plugins } from '@capacitor/core';
const { LocalNotifications } = Plugins;

const notifs = await LocalNotifications.schedule({
  notifications: [
    {
      title: "Title",
      body: "Body",
      id: 1,
      schedule: { at: new Date(Date.now() + 1000 * 5) },
      sound: null,
      attachments: null,
      actionTypeId: "",
      extra: null
    }
  ]
});
console.log('scheduled notifications', notifs);
```

## Local Notifications configuration (Android only)

The local notification plugin allows the following configuration values to be added in `capacitor.config.json` for the Android platform:

- `smallIcon`: It allows you to set the default icon for the local notification.
- `iconColor`: It allows you to set the default color for the local notification icon.
- `sound`: It allows you to set the default notification sound. On Android 26+ it sets the default channel sound and can't be changed unless the app is uninstalled.

```json
 "plugins": {
    "LocalNotifications": {
      "smallIcon": "ic_stat_icon_config_sample",
      "iconColor": "#488AFF",
      "sound": "beep.wav"
    }
  }
```

## API

<plugin-api name="local-notifications"></plugin-api>
