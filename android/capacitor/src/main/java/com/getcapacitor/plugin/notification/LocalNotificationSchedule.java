package com.getcapacitor.plugin.notification;

import android.text.format.DateUtils;

import com.getcapacitor.JSObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class LocalNotificationSchedule {

  public static String JS_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

  private Date at;
  private Boolean repeats;
  private String every;
  private Integer count;

  private DateMatch on;


  public LocalNotificationSchedule(JSObject jsonNotification) throws ParseException {
    JSObject schedule = jsonNotification.getJSObject("schedule");
    if (schedule != null) {
      // Every specific unit of time (always constant)
      buildEveryElement(schedule);
      // Count of units of time from every to repeat on
      buildCountElement(schedule);
      // At specific moment of time (with repeating option)
      buildAtElement(schedule);
      // Build on - recurring times. For e.g. every 1st day of the month at 8:30.
      buildOnElement(schedule);
    }
  }

  public LocalNotificationSchedule() {
  }

  private void buildEveryElement(JSObject schedule) {
    // 'year'|'month'|'two-weeks'|'week'|'day'|'hour'|'minute'|'second';
    this.every = schedule.getString("every");
  }

  private void buildCountElement(JSObject schedule) {
    this.count = schedule.getInteger("count", 1);
  }

  private void buildAtElement(JSObject schedule) throws ParseException {
    this.repeats = schedule.getBool("repeats");
    String dateString = schedule.getString("at");
    if (dateString != null) {
      SimpleDateFormat sdf = new SimpleDateFormat(JS_DATE_FORMAT);
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      this.at = sdf.parse(dateString);
    }
  }

  private void buildOnElement(JSObject schedule) {
    JSObject onJson = schedule.getJSObject("on");
    if (onJson != null) {
      this.on = new DateMatch();
      on.setYear(onJson.getInteger("year"));
      on.setMonth(onJson.getInteger("month"));
      on.setDay(onJson.getInteger("day"));
      on.setHour(onJson.getInteger("hour"));
      on.setMinute(onJson.getInteger("minute"));
    }
  }

  public DateMatch getOn() {
    return on;
  }

  public void setOn(DateMatch on) {
    this.on = on;
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

  public int getCount() {
    return count;
  }

  public void setCount(int count) {
    this.count = count;
  }

  public boolean isRepeating() {
    return Boolean.TRUE.equals(this.repeats);
  }

  public boolean isRemovable() {
    if (every == null && on == null) {
      if (at != null) {
        return !isRepeating();
      } else {
        return true;
      }
    }
    return false;
  }

  /**
   * Get constant long value representing specific interval of time (weeks, days etc.)
   */
  public Long getEveryInterval() {
    switch (every) {
      case "year":
        return count * DateUtils.YEAR_IN_MILLIS;
      case "month":
        // This case is just approximation as months have different number of days
        return count * 30 * DateUtils.DAY_IN_MILLIS;
      case "two-weeks":
        return count * 2 * DateUtils.WEEK_IN_MILLIS;
      case "week":
        return count * DateUtils.WEEK_IN_MILLIS;
      case "day":
        return count * DateUtils.DAY_IN_MILLIS;
      case "hour":
        return count * DateUtils.HOUR_IN_MILLIS;
      case "minute":
        return count * DateUtils.MINUTE_IN_MILLIS;
      case "second":
        return count * DateUtils.SECOND_IN_MILLIS;
      default:
        return null;
    }
  }

  /**
   * Get next trigger time based on calendar and current time
   *
   * @param currentTime - current time that will be used to calculate next trigger
   * @return millisecond trigger
   */
  public Long getNextOnSchedule(Date currentTime) {
    return this.on.nextTrigger(currentTime);
  }

}
