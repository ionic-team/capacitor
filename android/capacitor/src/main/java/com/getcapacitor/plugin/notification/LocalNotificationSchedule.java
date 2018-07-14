package com.getcapacitor.plugin.notification;

import android.text.format.DateUtils;

import com.getcapacitor.JSObject;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class LocalNotificationSchedule {

  public static String JS_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

  private Date at;
  private Boolean repeats;
  private String every;
  private Date on;


  public LocalNotificationSchedule(JSObject jsonNotification) throws ParseException {
    JSObject schedule = jsonNotification.getJSObject("schedule");
    if(schedule !=null){

    }
    this.repeats = schedule.getBool("repeats");
    // 'year'|'month'|'two-weeks'|'week'|'day'|'hour'|'minute'|'second';
    this.every = schedule.getString("every");
    String dateString = schedule.getString("at");
    if (dateString != null) {
      SimpleDateFormat sdf = new SimpleDateFormat(JS_DATE_FORMAT);
      this.at = sdf.parse(dateString);
    }
    // TODO
    //    on?: {
    //      year?: number;
    //      month?: number;
    //      day?: number;
    //      hour?: number;
    //      minute?: number;
    //    };
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

  public Date getOn() {
    return on;
  }

  public void setOn(Date on) {
    this.on = on;
  }

  public Long getNextOnSchedule() {
    // TODO
    return null;
  }
}