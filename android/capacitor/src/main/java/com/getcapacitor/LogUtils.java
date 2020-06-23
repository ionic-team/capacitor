package com.getcapacitor;

import android.text.TextUtils;

/**
 * @deprecated
 */
public abstract class LogUtils {

  /**
   * @deprecated
   */
  public static final String LOG_TAG_CORE = "Capacitor";

  /**
   * @deprecated
   */
  public static final String LOG_TAG_PLUGIN = LOG_TAG_CORE + "/Plugin";

  /**
   * Creates a core log TAG
   *
   * @deprecated
   * @param subTags sub log tags joined by a slash
   */
  public static String getCoreTag(String... subTags) {
    return getLogTag(LOG_TAG_CORE, subTags);
  }

  /**
   * Creates a plugin log TAG
   *
   * @deprecated
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
