---
title: Permissions
description: Permissions API
url: /docs/apis/permissions
contributors:
  - mlynch
---

<plugin-platforms platforms="pwa,electron,ios,android"></plugin-platforms>

# Permissions

The Permissions API provides methods to check if certain permissions have been granted before requesting them.

This can be useful, for example, to avoid a user denying a permission request due to lack of context behind why the app is requesting the permission. Instead, checking the permission
first and optionally displaying a custom UI to prepare the user for the permission check could increase permission allow rates and improve user experience.

## API

<plugin-api name="permissions"></plugin-api>
