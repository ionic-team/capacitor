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

  private Context context;

  public AndroidProtocolHandler(Context context) {
    this.context = context;
  }

  public InputStream openAsset(String path) throws IOException {
    return context.getAssets().open(path, AssetManager.ACCESS_STREAMING);
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
        Log.e(LogUtils.getCoreTag(), "Asset not of type string: " + uri);
      }
    } catch (ClassNotFoundException | IllegalAccessException | NoSuchFieldException e) {
      Log.e(LogUtils.getCoreTag(), "Unable to open resource URL: " + uri, e);
    }
    return null;
  }

  private static int getFieldId(Context context, String assetType, String assetName)
      throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
    Class<?> d = context.getClassLoader()
        .loadClass(context.getPackageName() + ".R$" + assetType);
    java.lang.reflect.Field field = d.getField(assetName);
    int id = field.getInt(null);
    return id;
  }

  public InputStream openFile(String filePath) throws IOException  {
    String realPath = filePath.replace(Bridge.CAPACITOR_FILE_START, "");
    File localFile = new File(realPath);
    return new FileInputStream(localFile);
  }

  public InputStream openContentUrl(Uri uri)  throws IOException {
    Integer port = uri.getPort();
    String baseUrl = uri.getScheme() + "://" + uri.getHost();
    if (port != -1) {
      baseUrl += ":" + port;
    }
    String realPath = uri.toString().replace(baseUrl + Bridge.CAPACITOR_CONTENT_START, "content:/");

    InputStream stream = null;
    try {
      stream = context.getContentResolver().openInputStream(Uri.parse(realPath));
    } catch (SecurityException e) {
      Log.e(LogUtils.getCoreTag(), "Unable to open content URL: " + uri, e);
    }
    return stream;
  }

  private static int getValueType(Context context, int fieldId) {
    TypedValue value = new TypedValue();
    context.getResources().getValue(fieldId, value, true);
    return value.type;
  }
}
