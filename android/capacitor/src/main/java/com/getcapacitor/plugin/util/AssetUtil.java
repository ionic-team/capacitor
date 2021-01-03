package com.getcapacitor.plugin.util;

import android.content.ContentResolver;
import android.content.Context;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.StrictMode;
import androidx.core.content.FileProvider;
import com.getcapacitor.Logger;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.UUID;

/**
 * Manager for assets.
 */
public final class AssetUtil {

    public static final int RESOURCE_ID_ZERO_VALUE = 0;
    // Name of the storage folder
    private static final String STORAGE_FOLDER = "/capacitorassets";

    // Ref to the context passed through the constructor to access the
    // resources and app directory.
    private final Context context;

    /**
     * Constructor
     *
     * @param context Application context.
     */
    private AssetUtil(Context context) {
        this.context = context;
    }

    /**
     * Static method to retrieve class instance.
     *
     * @param context Application context.
     */
    public static AssetUtil getInstance(Context context) {
        return new AssetUtil(context);
    }

    /**
     * The URI for a path.
     *
     * @param path The given path.
     */
    public Uri parse(String path) {
        if (path == null || path.isEmpty()) {
            return Uri.EMPTY;
        } else if (path.startsWith("res:")) {
            return getUriForResourcePath(path);
        } else if (path.startsWith("file:///")) {
            return getUriFromPath(path);
        } else if (path.startsWith("file://")) {
            return getUriFromAsset(path);
        } else if (path.startsWith("http")) {
            return getUriFromRemote(path);
        } else if (path.startsWith("content://")) {
            return Uri.parse(path);
        }

        return Uri.EMPTY;
    }

    /**
     * URI for a file.
     *
     * @param path Absolute path like file:///...
     *
     * @return URI pointing to the given path.
     */
    private Uri getUriFromPath(String path) {
        String absPath = path.replaceFirst("file://", "").replaceFirst("\\?.*$", "");
        File file = new File(absPath);

        if (!file.exists()) {
            Logger.error("File not found: " + file.getAbsolutePath());
            return Uri.EMPTY;
        }

        return getUriFromFile(file);
    }

    /**
     * URI for an asset.
     *
     * @param path Asset path like file://...
     *
     * @return URI pointing to the given path.
     */
    private Uri getUriFromAsset(String path) {
        String resPath = path.replaceFirst("file:/", "www").replaceFirst("\\?.*$", "");
        String fileName = resPath.substring(resPath.lastIndexOf('/') + 1);
        File file = getTmpFile(fileName);

        if (file == null) return Uri.EMPTY;

        try {
            AssetManager assets = context.getAssets();
            InputStream in = assets.open(resPath);
            FileOutputStream out = new FileOutputStream(file);
            copyFile(in, out);
        } catch (Exception e) {
            Logger.error("File not found: assets/" + resPath);
            return Uri.EMPTY;
        }

        return getUriFromFile(file);
    }

    /**
     * The URI for a resource.
     *
     * @param path The given relative path.
     *
     * @return URI pointing to the given path.
     */
    private Uri getUriForResourcePath(String path) {
        Resources res = context.getResources();
        String resPath = path.replaceFirst("res://", "");
        int resId = getResId(resPath);

        if (resId == 0) {
            Logger.error("File not found: " + resPath);
            return Uri.EMPTY;
        }

        return new Uri.Builder()
            .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
            .authority(res.getResourcePackageName(resId))
            .appendPath(res.getResourceTypeName(resId))
            .appendPath(res.getResourceEntryName(resId))
            .build();
    }

    /**
     * Uri from remote located content.
     *
     * @param path Remote address.
     *
     * @return Uri of the downloaded file.
     */
    private Uri getUriFromRemote(String path) {
        File file = getTmpFile();

        if (file == null) return Uri.EMPTY;

        try {
            URL url = new URL(path);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();

            StrictMode.setThreadPolicy(policy);

            connection.setRequestProperty("Connection", "close");
            connection.setConnectTimeout(5000);
            connection.connect();

            InputStream in = connection.getInputStream();
            FileOutputStream out = new FileOutputStream(file);

            copyFile(in, out);
            return getUriFromFile(file);
        } catch (MalformedURLException e) {
            Logger.error(Logger.tags("Asset"), "Incorrect URL", e);
        } catch (FileNotFoundException e) {
            Logger.error(Logger.tags("Asset"), "Failed to create new File from HTTP Content", e);
        } catch (IOException e) {
            Logger.error(Logger.tags("Asset"), "No Input can be created from http Stream", e);
        }

        return Uri.EMPTY;
    }

    /**
     * Copy content from input stream into output stream.
     *
     * @param in  The input stream.
     * @param out The output stream.
     */
    private void copyFile(InputStream in, FileOutputStream out) {
        byte[] buffer = new byte[1024];
        int read;

        try {
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            out.flush();
            out.close();
        } catch (Exception e) {
            Logger.error("Error copying", e);
        }
    }

    /**
     * Resource ID for drawable.
     *
     * @param resPath Resource path as string.
     *
     * @return The resource ID or 0 if not found.
     */
    public int getResId(String resPath) {
        int resId = getResId(context.getResources(), resPath);

        if (resId == 0) {
            resId = getResId(Resources.getSystem(), resPath);
        }

        return resId;
    }

    /**
     * Get resource ID.
     *
     * @param res     The resources where to look for.
     * @param resPath The name of the resource.
     *
     * @return The resource ID or 0 if not found.
     */
    private int getResId(Resources res, String resPath) {
        String pkgName = getPkgName(res);
        String resName = getBaseName(resPath);
        int resId;

        resId = res.getIdentifier(resName, "mipmap", pkgName);

        if (resId == 0) {
            resId = res.getIdentifier(resName, "drawable", pkgName);
        }

        if (resId == 0) {
            resId = res.getIdentifier(resName, "raw", pkgName);
        }

        return resId;
    }

    /**
     * Convert URI to Bitmap.
     *
     * @param uri Internal image URI
     */
    public Bitmap getIconFromUri(Uri uri) throws IOException {
        InputStream input = context.getContentResolver().openInputStream(uri);
        return BitmapFactory.decodeStream(input);
    }

    /**
     * Extract name of drawable resource from path.
     *
     * @param resPath Resource path as string.
     */
    private String getBaseName(String resPath) {
        String drawable = resPath;

        if (drawable.contains("/")) {
            drawable = drawable.substring(drawable.lastIndexOf('/') + 1);
        }

        if (resPath.contains(".")) {
            drawable = drawable.substring(0, drawable.lastIndexOf('.'));
        }

        return drawable;
    }

    /**
     * Returns a file located under the external cache dir of that app.
     *
     * @return File with a random UUID name.
     */
    private File getTmpFile() {
        return getTmpFile(UUID.randomUUID().toString());
    }

    /**
     * Returns a file located under the external cache dir of that app.
     *
     * @param name The name of the file.
     *
     * @return File with the provided name.
     */
    private File getTmpFile(String name) {
        File dir = context.getExternalCacheDir();

        if (dir == null) {
            dir = context.getCacheDir();
        }

        if (dir == null) {
            Logger.error(Logger.tags("Asset"), "Missing cache dir", null);
            return null;
        }

        String storage = dir.toString() + STORAGE_FOLDER;

        //noinspection ResultOfMethodCallIgnored
        new File(storage).mkdir();

        return new File(storage, name);
    }

    /**
     * Get content URI for the specified file.
     *
     * @param file The file to get the URI.
     *
     * @return content://...
     */
    private Uri getUriFromFile(File file) {
        try {
            String authority = context.getPackageName() + ".provider";
            return FileProvider.getUriForFile(context, authority, file);
        } catch (IllegalArgumentException e) {
            Logger.error("File not supported by provider", e);
            return Uri.EMPTY;
        }
    }

    /**
     * Package name specified by the resource bundle.
     */
    private String getPkgName(Resources res) {
        return res == Resources.getSystem() ? "android" : context.getPackageName();
    }

    public static int getResourceID(Context context, String resourceName, String dir) {
        return context.getResources().getIdentifier(resourceName, dir, context.getPackageName());
    }

    public static String getResourceBaseName(String resPath) {
        if (resPath == null) return null;

        if (resPath.contains("/")) {
            return resPath.substring(resPath.lastIndexOf('/') + 1);
        }

        if (resPath.contains(".")) {
            return resPath.substring(0, resPath.lastIndexOf('.'));
        }

        return resPath;
    }
}
