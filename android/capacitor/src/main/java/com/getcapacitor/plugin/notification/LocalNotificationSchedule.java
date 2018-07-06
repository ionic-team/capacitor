package com.getcapacitor.plugin.notification;

import android.text.format.DateUtils;

import com.getcapacitor.plugin.common.JsonParserUtils;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class LocalNotificationSchedule {
  private Date at;
  private Boolean repeats;
  private String every;
  // TODO `on` field support

  public LocalNotificationSchedule(JSONObject jsonNotification) throws ParseException {
    JSONObject schedule = null;
    try {
      schedule = jsonNotification.getJSONObject("schedule");
    } catch (JSONException e) {
      return;
    }
    this.repeats = JsonParserUtils.getBoolean("repeats", schedule);
    // 'year'|'month'|'two-weeks'|'week'|'day'|'hour'|'minute'|'second';
    this.every = JsonParserUtils.getString("every", schedule);
    String dateStr = JsonParserUtils.getString("at", schedule);
    if (dateStr != null) {
      SimpleDateFormat sdf = new SimpleDateFormat(JsonParserUtils.JS_DATE_FORMAT);
      this.at = sdf.parse(dateStr);
    }
  }

  public LocalNotificationSchedule() {
  }

  public Date getAt() {
    return at;
  }

  public void setAt(Date at) {
    this.at = at;
  }

  public Boolean getRepeats() {
    return repeats;
  }

  public void setRepeats(Boolean repeats) {
    this.repeats = repeats;
  }

  public String getEvery() {
    return every;
  }

  public void setEvery(String every) {
    this.every = every;
  }

  public boolean isRepeating() {
    return Boolean.TRUE.equals(this.repeats) || this.every != null;
  }

  public Long getEveryInterval() {
    switch (every) {
      case "year":
        return DateUtils.YEAR_IN_MILLIS;
      case "month":
        // This case is just approximation as months have different number of days
        return 30 * DateUtils.DAY_IN_MILLIS;
      case "two-weeks":
        return 2 * DateUtils.WEEK_IN_MILLIS;
      case "week":
        return DateUtils.WEEK_IN_MILLIS;
      case "day":
        return DateUtils.DAY_IN_MILLIS;
      case "hour":
        return DateUtils.HOUR_IN_MILLIS;
      case "minute":
        return DateUtils.MINUTE_IN_MILLIS;
      case "second":
        return DateUtils.SECOND_IN_MILLIS;
      default:
        return null;
    }

  }
}