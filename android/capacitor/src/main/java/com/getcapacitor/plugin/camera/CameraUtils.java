package com.getcapacitor.plugin.camera;

import android.app.Activity;
import android.net.Uri;
import android.os.Environment;

import androidx.core.content.FileProvider;

import com.getcapacitor.Logger;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class CameraUtils {
    public static Uri createImageFileUri(Activity activity, String appId) throws IOException{
        File photoFile = CameraUtils.createImageFile(activity);
        return FileProvider.getUriForFile(activity, appId + ".fileprovider", photoFile);
    }

    public static File createImageFile(Activity activity) throws IOException {
        // Create an image file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES);

        File image = File.createTempFile(
                imageFileName,  /* prefix */
                ".jpg",         /* suffix */
                storageDir      /* directory */
        );

        return image;
    }

    protected static String getLogTag() {
        return Logger.tags("CameraUtils");
    }
}
