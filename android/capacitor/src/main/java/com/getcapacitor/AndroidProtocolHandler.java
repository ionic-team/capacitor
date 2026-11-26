// Copyright 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

package com.getcapacitor;

import android.content.Context;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Environment;
import android.util.TypedValue;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class AndroidProtocolHandler {

    private Context context;
    private List<File> appStorageRoots;

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
                Logger.error("Asset not of type string: " + uri);
            }
        } catch (ClassNotFoundException | IllegalAccessException | NoSuchFieldException e) {
            Logger.error("Unable to open resource URL: " + uri, e);
        }
        return null;
    }

    private static int getFieldId(Context context, String assetType, String assetName)
        throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException
    {
        Class<?> d = context.getClassLoader().loadClass(context.getPackageName() + ".R$" + assetType);
        java.lang.reflect.Field field = d.getField(assetName);
        return field.getInt(null);
    }

    public InputStream openFile(String filePath) throws IOException {
        String realPath = filePath.replace(Bridge.CAPACITOR_FILE_START, "");
        File localFile = new File(realPath);
        return new FileInputStream(localFile);
    }

    /**
     * Opens a file served from the base path the app is hosted from (see {@code setServerBasePath}).
     * The request path is decoded by {@link Uri#getPath()}, so an encoded slash ({@code %2F}) can carry
     * {@code ..} segments that the browser did not resolve. The resolved file must therefore sit inside
     * the base path, or the request would read any file the app can read.
     *
     * @param basePath the directory the app is hosted from
     * @param filePath the base path followed by the request path
     * @throws FileNotFoundException if the resolved file is outside of the base path
     */
    public InputStream openBasePathFile(String basePath, String filePath) throws IOException {
        String base = new File(basePath).getCanonicalPath();
        File file = new File(filePath).getCanonicalFile();
        String resolved = file.getPath();
        if (!resolved.equals(base) && !resolved.startsWith(base.endsWith(File.separator) ? base : base + File.separator)) {
            throw new FileNotFoundException("File is outside of the base path: " + filePath);
        }
        return new FileInputStream(file);
    }

    /**
     * Opens a file whose location was chosen by a {@link RouteProcessor}. The processor may map requests
     * outside the base path on purpose, so containment is not checked here. The request path is decoded
     * by {@link Uri#getPath()}, so an encoded slash ({@code %2F}) can still carry {@code ..} segments that
     * the browser did not resolve and that a processor would pass on; such requests are refused.
     *
     * @param requestPath the decoded request path
     * @param processedPath the file path returned by the route processor
     * @throws FileNotFoundException if the request path contains a parent-directory segment
     */
    public InputStream openRoutedFile(String requestPath, String processedPath) throws IOException {
        for (String segment : requestPath.split("/")) {
            if (segment.equals("..")) {
                throw new FileNotFoundException("Parent-directory segment in request path: " + requestPath);
            }
        }
        return openFile(processedPath);
    }

    /**
     * Opens a file requested through the {@link Bridge#CAPACITOR_FILE_START} proxy route.
     * Unlike {@link #openFile(String)}, the resolved path must sit inside the app's own storage or
     * shared/external storage, so the route cannot expose app-private data (shared_prefs, databases)
     * or system files such as /proc or /etc.
     *
     * @param filePath the request path, starting with {@link Bridge#CAPACITOR_FILE_START}
     * @throws IOException if the file cannot be opened or its location is not allowed
     */
    public InputStream openProxiedFile(String filePath) throws IOException {
        String realPath = filePath.startsWith(Bridge.CAPACITOR_FILE_START)
            ? filePath.substring(Bridge.CAPACITOR_FILE_START.length())
            : filePath;
        // Canonicalizing resolves ".." segments and symlinks; open the resolved file so the checked path is the read one.
        File canonicalFile = new File(realPath).getCanonicalFile();
        if (!isInAllowedLocation(canonicalFile)) {
            throw new IOException("Path is outside the locations served by the file proxy: " + realPath);
        }
        return new FileInputStream(canonicalFile);
    }

    private boolean isInAllowedLocation(File canonicalFile) throws IOException {
        String path = canonicalFile.getPath();
        for (File root : getAllowedRoots()) {
            String rootPath = root.getCanonicalPath();
            if (path.equals(rootPath) || path.startsWith(rootPath + File.separator)) {
                return true;
            }
        }
        return false;
    }

    @SuppressWarnings("deprecation")
    /**
     * The app's files and cache directories (Filesystem Data/Library/Cache, Camera temporary images). They do not
     * change while the app runs, unlike the external storage roots, so they are looked up once.
     */
    private List<File> getAppStorageRoots() {
        List<File> roots = appStorageRoots;
        if (roots == null) {
            roots = new ArrayList<>();
            addIfNotNull(roots, context.getFilesDir());
            addIfNotNull(roots, context.getCacheDir());
            appStorageRoots = roots;
        }
        return roots;
    }

    private List<File> getAllowedRoots() {
        List<File> roots = new ArrayList<>(getAppStorageRoots());
        // Primary shared storage (Filesystem Documents/ExternalStorage, gallery and media picks)
        addIfNotNull(roots, Environment.getExternalStorageDirectory());
        // App-specific external dirs, and the root of every other volume (e.g. SD cards) they live on
        List<File> externalDirs = new ArrayList<>();
        for (File dir : context.getExternalFilesDirs(null)) {
            externalDirs.add(dir);
        }
        for (File dir : context.getExternalCacheDirs()) {
            externalDirs.add(dir);
        }
        for (File dir : externalDirs) {
            if (dir == null) {
                continue;
            }
            roots.add(dir);
            String dirPath = dir.getPath();
            int androidDirIndex = dirPath.indexOf("/Android/");
            if (androidDirIndex > 0) {
                roots.add(new File(dirPath.substring(0, androidDirIndex)));
            }
        }
        return roots;
    }

    private static void addIfNotNull(List<File> roots, File dir) {
        if (dir != null) {
            roots.add(dir);
        }
    }

    public InputStream openContentUrl(Uri uri) throws IOException {
        Integer port = uri.getPort();
        String baseUrl = uri.getScheme() + "://" + uri.getHost();
        if (port != -1) {
            baseUrl += ":" + port;
        }
        String realPath = uri.toString().replace(baseUrl + Bridge.CAPACITOR_CONTENT_START, "content:/");

        InputStream stream = null;
        try {
            stream = context.getContentResolver().openInputStream(Uri.parse(realPath));
        } catch (RuntimeException e) {
            // The target provider runs in this process and may throw unchecked exceptions for a malformed or
            // unknown path (e.g. FileProvider throws IllegalArgumentException, older versions
            // StringIndexOutOfBoundsException). Left uncaught they crash the app, so report "not found" instead.
            Logger.error("Unable to open content URL: " + uri, e);
        }
        return stream;
    }

    private static int getValueType(Context context, int fieldId) {
        TypedValue value = new TypedValue();
        context.getResources().getValue(fieldId, value, true);
        return value.type;
    }
}
