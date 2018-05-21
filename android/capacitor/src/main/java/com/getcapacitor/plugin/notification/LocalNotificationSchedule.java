package com.getcapacitor.plugin.notification;

import org.json.JSONObject;

import java.util.Date;

public class LocalNotificationSchedule {
  private Date at;
  private Boolean repeat;
  private String every;
  private JSONObject on;

  public Date getAt() {
    return at;
  }

  public void setAt(Date at) {
    this.at = at;
  }

  public Boolean getRepeat() {
    return repeat;
  }

  public void setRepeat(Boolean repeat) {
    this.repeat = repeat;
  }

  public String getEvery() {
    return every;
  }

  public void setEvery(String every) {
    this.every = every;
  }

  public JSONObject getOn() {
    return on;
  }

  public void setOn(JSONObject on) {
    this.on = on;
  }
}