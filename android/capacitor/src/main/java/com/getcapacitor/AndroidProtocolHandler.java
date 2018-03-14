// Copyright 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

package com.getcapacitor;

import android.content.Context;
import android.content.res.AssetManager;
import android.net.Uri;
import android.util.Log;
import android.util.TypedValue;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;


public class AndroidProtocolHandler {
  private static final String TAG = "AndroidProtocolHandler";

  private Context context;

  public AndroidProtocolHandler(Context context) {
    this.context = context;
  }

  public InputStream openAsset(String path, String assetPath) throws IOException {
    if (path.startsWith(assetPath + "/_capacitor_")) {
      if (path.contains("content://")) {
        String contentPath = path.replace(assetPath + "/_capacitor_/", "content://");
        return context.getContentResolver().openInputStream(Uri.parse(contentPath));
      } else {
        String filePath = path.replace(assetPath + "/_capacitor_/", "");
        return new FileInputStream(new File(filePath));
      }
    } else {
      return context.getAssets().open(path, AssetManager.ACCESS_STREAMING);
    }
  }

  public InputStream openResource(Uri uri) {
    assert uri.getPath() != null;
    // The path must be of the form ".../asset_type/asset_name.ext".
    List<String> pathSegments = uri.getPathSegments();
    String assetType = pathSegments.get(pathSegments.size() - 2);
    String assetName = pathSegments.get(pathSegments.size() - 1);

    // Drop the file extension.
    assetName = assetName.split("\\.")[0];
    try {
      // Use the application context for resolving the resource package name so that we do
      // not use the browser's own resources. Note that if 'context' here belongs to the
      // test suite, it does not have a separate application context. In that case we use
      // the original context object directly.
      if (context.getApplicationContext() != null) {
        context = context.getApplicationContext();
      }
      int fieldId = getFieldId(context, assetType, assetName);
      int valueType = getValueType(context, fieldId);
      if (valueType == TypedValue.TYPE_STRING) {
        return context.getResources().openRawResource(fieldId);
      } else {
        Log.e(TAG, "Asset not of type string: " + uri);
        return null;
      }
    } catch (ClassNotFoundException e) {
      Log.e(TAG, "Unable to open resource URL: " + uri, e);
      return null;
    } catch (NoSuchFieldException e) {
      Log.e(TAG, "Unable to open resource URL: " + uri, e);
      return null;
    } catch (IllegalAccessException e) {
      Log.e(TAG, "Unable to open resource URL: " + uri, e);
      return null;
    }
  }

  private static int getFieldId(Context context, String assetType, String assetName)
      throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
    Class<?> d = context.getClassLoader()
        .loadClass(context.getPackageName() + ".R$" + assetType);
    java.lang.reflect.Field field = d.getField(assetName);
    int id = field.getInt(null);
    return id;
  }

  private static int getValueType(Context context, int fieldId) {
    TypedValue value = new TypedValue();
    context.getResources().getValue(fieldId, value, true);
    return value.type;
  }
}
