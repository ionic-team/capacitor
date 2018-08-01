package com.getcapacitor;

import android.text.TextUtils;

/**
 *
 */
public abstract class LogUtils {

  public static final String LOG_TAG_CORE = "Capacitor";
  public static final String LOG_TAG_PLUGIN = LOG_TAG_CORE + "/Plugin";

  /**
   * Creates a core log TAG
   * @param subTags sub log tags joined by a slash
   */
  public static String getCoreTag(String... subTags) {
    return getLogTag(LOG_TAG_CORE, subTags);
  }

  /**
   * Creates a plugin log TAG
   * @param subTags sub log tags joined by a slash
   */
  public static String getPluginTag(String... subTags) {
    return getLogTag(LOG_TAG_PLUGIN, subTags);
  }

  private static String getLogTag(String mainTag, String[] subTags) {
    if (subTags != null && subTags.length > 0) {
      return mainTag + "/" + TextUtils.join("/", subTags);
    }
    return mainTag;
  }


}
