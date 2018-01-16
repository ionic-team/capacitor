package com.getcapacitor.myapp;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.Nullable;

/**
 * SplashActivity is a simple activity that merely shows a launch image for your app
 * immediately on open.
 *
 * https://medium.com/@ssaurel/create-a-splash-screen-on-android-the-right-way-93d6fb444857
 */
public class SplashActivity extends Activity {
  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.splash);

    new Handler().postDelayed(new Runnable() {
      @Override
      public void run() {
        Intent intent = new Intent(getApplicationContext(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
        startActivity(intent);
        finish();
      }
    }, 2000);
  }
}
