# Background Tasks

The Background Task API makes it easy to run background tasks. Currently, this plugin
supports running a task when the app is backgrounded, and soon will support periodic background
fetch operations.

<plugin-api index="true" name="background-task"></plugin-api>

## Background Task Guidelines

Mobile operating systems have strict, constantly changing guidelines for background tasks. Running
indefinitely in the background is limited to apps that need to play audio, maintain VoIP connections,
track geolocation for navigation purposes, and a limited set of other tasks. All other apps should
expect to perform periodic, short background tasks, such as finishing an upload when the app goes to the
background, and periodically syncing data.

Plugins that claim to offer infinite background operation outside of those core use cases _will cause App Store rejections_! This limitation is the same for developers using any mobile app technology, not just Capacitor.

Generally, Android is less strict about background tasks, but your app should code to the lowest common demoniator
in order to be a good actor on all platforms.

## Example

```typescript
import { Plugins } from '@capacitor/core';

const { App, BackgroundTask } = Plugins;

App.addEventListener('appStateChange', (state) => {

  if (!state.isActive) {
    // The app has become inactive. We should check if we have some work left to do, and, if so,
    // execute a background task that will allow us to finish that work before the OS
    // suspends or terminates our app:

    let taskId = BackgroundTask.exec(async () => {
      // In this function We might finish an upload, let a network request
      // finish, persist some data, or perform some other task

      // Example
      setTimeout(() => {
        // Must call in order to end our task otherwise
        // we risk our app being terminated, and possibly
        // being labled as impacting battery life
        BackgroundTask.finish({
          taskId
        });
      }, 30000); // Set a long timeout as an example
    });
  }
})
```

## API

<plugin-api name="background-task"></plugin-api>