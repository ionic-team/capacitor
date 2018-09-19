package com.getcapacitor.plugin.camera;

import android.app.Activity;
import android.net.Uri;
import android.os.Environment;
import android.support.v4.content.FileProvider;
import android.util.Log;

import com.getcapacitor.LogUtils;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class CameraUtils {
    public static Uri createImageFileUri(Activity activity, String appId) throws IOException{
        File photoFile = CameraUtils.createImageFile(activity, false);
        return FileProvider.getUriForFile(activity, appId + ".fileprovider", photoFile);
    }

    public static File createImageFile(Activity activity, boolean saveToGallery) throws IOException {
        // Create an image file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir;
        if(saveToGallery) {
            Log.d(getLogTag(), "Trying to save image to public external directory");
            storageDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
        }  else {
            storageDir = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        }

        File image = File.createTempFile(
                imageFileName,  /* prefix */
                ".jpg",         /* suffix */
                storageDir      /* directory */
        );

        return image;
    }

    protected static String getLogTag() {
        return LogUtils.getCoreTag("CameraUtils");
    }
}
