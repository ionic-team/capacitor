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

## API

<plugin-api name="local-notifications"></plugin-api>
