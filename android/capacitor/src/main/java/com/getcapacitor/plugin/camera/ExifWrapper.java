package com.getcapacitor.plugin.camera;

import androidx.exifinterface.media.ExifInterface;

import static androidx.exifinterface.media.ExifInterface.*;

import com.getcapacitor.JSObject;

public class ExifWrapper {
  private final ExifInterface exif;

  public ExifWrapper(ExifInterface exif) {
    this.exif = exif;
  }

  public JSObject toJson() {
    JSObject ret = new JSObject();

    if (this.exif == null) {
      return ret;
    }

    // Commented fields are for API 24. Left in to save someone the wrist damage later

    p(ret, TAG_APERTURE_VALUE);
    /*
    p(ret, TAG_ARTIST);
    p(ret, TAG_BITS_PER_SAMPLE);
    p(ret, TAG_BRIGHTNESS_VALUE);
    p(ret, TAG_CFA_PATTERN);
    p(ret, TAG_COLOR_SPACE);
    p(ret, TAG_COMPONENTS_CONFIGURATION);
    p(ret, TAG_COMPRESSED_BITS_PER_PIXEL);
    p(ret, TAG_COMPRESSION);
    p(ret, TAG_CONTRAST);
    p(ret, TAG_COPYRIGHT);
    */
    p(ret, TAG_DATETIME);
    /*
    p(ret, TAG_DATETIME_DIGITIZED);
    p(ret, TAG_DATETIME_ORIGINAL);
    p(ret, TAG_DEFAULT_CROP_SIZE);
    p(ret, TAG_DEVICE_SETTING_DESCRIPTION);
    p(ret, TAG_DIGITAL_ZOOM_RATIO);
    p(ret, TAG_DNG_VERSION);
    p(ret, TAG_EXIF_VERSION);
    p(ret, TAG_EXPOSURE_BIAS_VALUE);
    p(ret, TAG_EXPOSURE_INDEX);
    p(ret, TAG_EXIF_VERSION);
    p(ret, TAG_EXPOSURE_MODE);
    p(ret, TAG_EXPOSURE_PROGRAM);
    */
    p(ret, TAG_EXPOSURE_TIME);
    // p(ret, TAG_F_NUMBER);
    // p(ret, TAG_FILE_SOURCE);
    p(ret, TAG_FLASH);
    // p(ret, TAG_FLASH_ENERGY);
    // p(ret, TAG_FLASHPIX_VERSION);
    p(ret, TAG_FOCAL_LENGTH);
    // p(ret, TAG_FOCAL_LENGTH_IN_35MM_FILM);
    // p(ret, TAG_FOCAL_PLANE_RESOLUTION_UNIT);
    p(ret, TAG_FOCAL_LENGTH);
    // p(ret, TAG_GAIN_CONTROL);
    p(ret, TAG_GPS_LATITUDE);
    p(ret, TAG_GPS_LATITUDE_REF);
    p(ret, TAG_GPS_LONGITUDE);
    p(ret, TAG_GPS_LONGITUDE_REF);
    p(ret, TAG_GPS_ALTITUDE);
    p(ret, TAG_GPS_ALTITUDE_REF);
    // p(ret, TAG_GPS_AREA_INFORMATION);
    p(ret, TAG_GPS_DATESTAMP);
    /*
    API 24
    p(ret, TAG_GPS_DEST_BEARING);
    p(ret, TAG_GPS_DEST_BEARING_REF);
    p(ret, TAG_GPS_DEST_DISTANCE_REF);
    p(ret, TAG_GPS_DEST_DISTANCE_REF);
    p(ret, TAG_GPS_DEST_LATITUDE);
    p(ret, TAG_GPS_DEST_LATITUDE_REF);
    p(ret, TAG_GPS_DEST_LONGITUDE);
    p(ret, TAG_GPS_DEST_LONGITUDE_REF);
    p(ret, TAG_GPS_DIFFERENTIAL);
    p(ret, TAG_GPS_DOP);
    p(ret, TAG_GPS_IMG_DIRECTION);
    p(ret, TAG_GPS_IMG_DIRECTION_REF);
    p(ret, TAG_GPS_MAP_DATUM);
    p(ret, TAG_GPS_MEASURE_MODE);
    */
    p(ret, TAG_GPS_PROCESSING_METHOD);
    /*
    API 24
    p(ret, TAG_GPS_SATELLITES);
    p(ret, TAG_GPS_SPEED);
    p(ret, TAG_GPS_SPEED_REF);
    p(ret, TAG_GPS_STATUS);
    */
    p(ret, TAG_GPS_TIMESTAMP);
    /*
    API 24
    p(ret, TAG_GPS_TRACK);
    p(ret, TAG_GPS_TRACK_REF);
    p(ret, TAG_GPS_VERSION_ID);
    p(ret, TAG_IMAGE_DESCRIPTION);
    */
    p(ret, TAG_IMAGE_LENGTH);
    // p(ret, TAG_IMAGE_UNIQUE_ID);
    p(ret, TAG_IMAGE_WIDTH);
    p(ret, TAG_ISO_SPEED);
    /*
    p(ret, TAG_INTEROPERABILITY_INDEX);
    p(ret, TAG_ISO_SPEED_RATINGS);
    p(ret, TAG_JPEG_INTERCHANGE_FORMAT);
    p(ret, TAG_JPEG_INTERCHANGE_FORMAT_LENGTH);
    p(ret, TAG_LIGHT_SOURCE);
    */
    p(ret, TAG_MAKE);
    /*
    p(ret, TAG_MAKER_NOTE);
    p(ret, TAG_MAX_APERTURE_VALUE);
    p(ret, TAG_METERING_MODE);
    */
    p(ret, TAG_MODEL);
    /*
    p(ret, TAG_NEW_SUBFILE_TYPE);
    p(ret, TAG_OECF);
    p(ret, TAG_ORF_ASPECT_FRAME);
    p(ret, TAG_ORF_PREVIEW_IMAGE_LENGTH);
    p(ret, TAG_ORF_PREVIEW_IMAGE_START);
    */
    p(ret, TAG_ORIENTATION);
    /*
    p(ret, TAG_ORF_THUMBNAIL_IMAGE);
    p(ret, TAG_PHOTOMETRIC_INTERPRETATION);
    p(ret, TAG_PIXEL_X_DIMENSION);
    p(ret, TAG_PIXEL_Y_DIMENSION);
    p(ret, TAG_PLANAR_CONFIGURATION);
    p(ret, TAG_PRIMARY_CHROMATICITIES);
    p(ret, TAG_REFERENCE_BLACK_WHITE);
    p(ret, TAG_RELATED_SOUND_FILE);
    p(ret, TAG_RESOLUTION_UNIT);
    p(ret, TAG_ROWS_PER_STRIP);
    p(ret, TAG_RW2_ISO);
    p(ret, TAG_RW2_JPG_FROM_RAW);
    */
    p(ret, TAG_WHITE_BALANCE);

    return ret;
  }

  public void p(JSObject o, String tag) {
    String val = exif.getAttribute(tag);
    o.put(tag, val);
  }
}
