package com.getcapacitor.plugin.notification;


import android.os.Parcel;
import android.os.Parcelable;

import java.util.Calendar;
import java.util.Date;

/**
 * Class that holds logic for on triggers
 * (Specific time)
 */
public class DateMatch implements Parcelable {

  public static final Parcelable.Creator CREATOR = new Parcelable.Creator() {
    public DateMatch createFromParcel(Parcel in) {
      return new DateMatch(in);
    }

    public DateMatch[] newArray(int size) {
      return new DateMatch[size];
    }
  };

  private Integer year;
  private Integer month;
  private Integer day;
  private Integer hour;
  private Integer minute;

  public DateMatch() {
  }

  public DateMatch(Parcel in) {
    this.year = in.readInt();
    this.month = in.readInt();
    this.day = in.readInt();
    this.hour = in.readInt();
    this.minute = in.readInt();
  }

  public void setYear(Integer year) {
    this.year = year;
  }

  public void setMonth(Integer month) {
    this.month = month;
  }

  public void setDay(Integer day) {
    this.day = day;
  }

  public void setHour(Integer hour) {
    this.hour = hour;
  }

  public void setMinute(Integer minute) {
    this.minute = minute;
  }

  /**
   * Gets a calendar instance pointing to the specified date.
   *
   * @param date The date to point.
   */
  private Calendar buildCalendar(Date date) {
    Calendar cal = Calendar.getInstance();
    cal.setTime(date);

    return cal;
  }

  /**
   * Calculates next trigger date for
   *
   * @param date base date used to calculate trigger
   * @return next trigger timestamp
   */
  public long nextTrigger(Date date) {
    Calendar current = buildCalendar(date);
    Calendar next = buildNextTriggerTime(date);
    return postponeTriggerIfNeeded(current, next);
  }

  /**
   * Postpone trigger if first schedule matches the past.
   */
  private long postponeTriggerIfNeeded(Calendar current, Calendar next) {
    int currentYear = current.get(Calendar.YEAR);
    if (next.get(Calendar.YEAR) < currentYear) {
      next.set(Calendar.YEAR, currentYear + 1);
      return next.getTimeInMillis();
    } else if (next.get(Calendar.MONTH) < current.get(Calendar.MONTH)) {
      next.set(Calendar.YEAR, currentYear + 1);
    } else if (next.get(Calendar.DAY_OF_MONTH) < current.get(Calendar.DAY_OF_MONTH)) {
      next.set(Calendar.MONTH, current.get(Calendar.MONTH) + 1);
    } else if (next.get(Calendar.HOUR_OF_DAY) < current.get(Calendar.HOUR_OF_DAY)) {
      next.set(Calendar.DAY_OF_MONTH, current.get(Calendar.DAY_OF_MONTH) + 1);
    } else if (next.get(Calendar.MINUTE) < current.get(Calendar.MINUTE)) {
      next.set(Calendar.HOUR_OF_DAY, current.get(Calendar.HOUR_OF_DAY) + 1);
    }
    return next.getTimeInMillis();
  }

  private Calendar buildNextTriggerTime(Date date) {
    Calendar next = buildCalendar(date);
    if (year != null) {
      next.set(Calendar.YEAR, year);
    }
    if (month != null) {
      next.set(Calendar.MONTH, month);
    }
    if (day != null) {
      next.set(Calendar.DAY_OF_MONTH, day);
    }
    if (hour != null) {
      next.set(Calendar.HOUR_OF_DAY, hour);
    }
    if (minute != null) {
      next.set(Calendar.MINUTE, minute);
    }
    return next;
  }

  @Override
  public int describeContents() {
    return 0;
  }

  @Override
  public void writeToParcel(Parcel dest, int flags) {
    dest.writeInt(year);
    dest.writeInt(month);
    dest.writeInt(day);
    dest.writeInt(hour);
    dest.writeInt(minute);
  }
}
