package com.getcapacitor;

import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.util.Log;

import java.io.IOException;

public class ImageUtils {
  /**
   * Resize an image to the given width and height. Leave one dimension 0 to
   * perform an aspect-ratio scale on the provided dimension.
   * @param bitmap
   * @param width
   * @param height
   * @return a new, scaled Bitmap
   */
  public static Bitmap resize(Bitmap bitmap, int width, int height) {
    float aspect = bitmap.getWidth() / (float) bitmap.getHeight();
    if (width > 0 && height > 0) {
      return Bitmap.createScaledBitmap(bitmap, width, height, false);
    } else if (width > 0) {
      return Bitmap.createScaledBitmap(bitmap, width, (int) (width * 1/aspect), false);
    } else if (height > 0) {
      return Bitmap.createScaledBitmap(bitmap, (int)(height * 1/aspect), height, false);
    }

    return bitmap;
  }

  /**
   * Transform an image with the given matrix
   * @param bitmap
   * @param matrix
   * @return
   */
  public static Bitmap transform(Bitmap bitmap, Matrix matrix) {
    return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
  }

  /**
   * Correct the orientation of an image by reading its exif information and rotating
   * the appropriate amount for portrait mode
   * @param bitmap
   * @param imageFileSavePath
   * @return
   */
  public static Bitmap correctOrientation(Bitmap bitmap, String imageFileSavePath) {
    try {
      ExifInterface exif = new ExifInterface(imageFileSavePath);

      int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);

      if (orientation != ExifInterface.ORIENTATION_NORMAL) {
        Bitmap newBitmap = transform(bitmap, getOrientationRotateMatrix(orientation));

        exif.setAttribute(ExifInterface.TAG_ORIENTATION, "" + ExifInterface.ORIENTATION_NORMAL);
        exif.saveAttributes();
      }
    } catch (IOException ex) {
      Log.e(Bridge.TAG, "Unable to load exif data for saved image", ex);
    }
    return bitmap;
  }

  /**
   * Get the Matrix needed to transform an image with the given orientation
   * to face up on portrait mode
   * @param orientation
   * @return
   */
  private static Matrix getOrientationRotateMatrix(int orientation) {
    Matrix matrix = new Matrix();
    switch (orientation) {
      case ExifInterface.ORIENTATION_FLIP_HORIZONTAL:
        matrix.setScale(-1, 1);
        break;
      case ExifInterface.ORIENTATION_ROTATE_180:
        matrix.setRotate(180);
        break;
      case ExifInterface.ORIENTATION_FLIP_VERTICAL:
        matrix.setRotate(180);
        matrix.postScale(-1, 1);
        break;
      case ExifInterface.ORIENTATION_TRANSPOSE:
        matrix.setRotate(90);
        matrix.postScale(-1, 1);
        break;
      case ExifInterface.ORIENTATION_ROTATE_90:
        matrix.setRotate(90);
        break;
      case ExifInterface.ORIENTATION_TRANSVERSE:
        matrix.setRotate(-90);
        matrix.postScale(-1, 1);
        break;
      case ExifInterface.ORIENTATION_ROTATE_270:
        matrix.setRotate(-90);
        break;
    }
    return matrix;
  }
}
