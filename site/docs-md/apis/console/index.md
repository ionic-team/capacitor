---
title: Console
description: Console API
url: /docs/apis/console
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Console

The Console API automatically sends `console.debug`, `console.error`, `console.info`, `console.log`, `console.trace` and `console.warn` calls to the native log system on each respective platform. This enables, for example,
`console.log` calls to be rendered in the Xcode and Android Studio log windows.

It can be disabled by using `hideLogs` entry in `capacitor.config.json`, check [common configuration](/docs/basics/configuring-your-app#common-configuration) for more information.

## Example

```typescript
console.log('I really enjoy Avocado Toast, and I\'m not ashamed to admit it');
```

The string will show up in your Xcode or Android Studio log stream.