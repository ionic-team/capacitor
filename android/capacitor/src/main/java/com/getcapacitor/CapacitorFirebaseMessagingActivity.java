package com.getcapacitor;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;

import com.getcapacitor.plugin.PushNotifications;

public class CapacitorFirebaseMessagingActivity extends Activity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        PushNotifications.sendNewIntent(getIntent());

        finish();

        PackageManager pm = getPackageManager();
        Intent launchIntent = pm.getLaunchIntentForPackage(getApplicationContext().getPackageName());
        startActivity(launchIntent); // Bring the app to the foreground, or perform launch activity if app is not alive
    }
}