package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;

import androidx.appcompat.app.AppCompatActivity;

import com.getcapacitor.android.R;
import com.getcapacitor.cordova.MockCordovaInterfaceImpl;
import com.getcapacitor.cordova.MockCordovaWebViewImpl;
import com.getcapacitor.plugin.App;

import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONTokener;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class BridgeActivity extends AppCompatActivity {
  protected Bridge bridge;
  private WebView webView;
  protected MockCordovaInterfaceImpl cordovaInterface;
  protected boolean keepRunning = true;
  private ArrayList<PluginEntry> pluginEntries;
  private PluginManager pluginManager;
  private CordovaPreferences preferences;
  private MockCordovaWebViewImpl mockWebView;

  private int activityDepth = 0;

  private String lastActivityPlugin;

  private List<Class<? extends Plugin>> initialPlugins = new ArrayList<>();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    try {
      this.init(savedInstanceState, loadPluginList("plugin-imports.json"));
    } catch (IOException | JSONException | ClassNotFoundException e) {
      e.printStackTrace();
    }
  }

  protected void init(Bundle savedInstanceState, List<Class<? extends Plugin>> plugins) {
    this.initialPlugins = plugins;

    loadConfig(this.getApplicationContext(),this);

    getApplication().setTheme(getResources().getIdentifier("AppTheme_NoActionBar", "style", getPackageName()));
    setTheme(getResources().getIdentifier("AppTheme_NoActionBar", "style", getPackageName()));
    setTheme(R.style.AppTheme_NoActionBar);


    setContentView(R.layout.bridge_layout_main);

    this.load(savedInstanceState);
  }

  @SuppressWarnings("unchecked")
  ArrayList<Class<? extends Plugin>> loadPluginList(String fileName) throws IOException, JSONException, ClassNotFoundException {
    ArrayList<Class<? extends Plugin>> pluginList = new ArrayList<>();
    JSONArray plugins = loadJsonArray(fileName);
    for (int iPlugin = 0; iPlugin < plugins.length(); ++iPlugin) {
      String plugin = (String) plugins.get(iPlugin);
      pluginList.add((Class<? extends Plugin>) Class.forName(plugin));
    }
    return pluginList;
  }

  private JSONArray loadJsonArray(String fileName) throws IOException, JSONException {
    JSONTokener tokener = new JSONTokener(loadJsonStringFromFile(fileName));
    return new JSONArray(tokener);
  }

  private String loadJsonStringFromFile(String fileName) throws IOException {
    BufferedReader reader = new BufferedReader(new InputStreamReader(getAssets().open(fileName)));
    // do reading, usually loop until end of file reading
    StringBuilder b = new StringBuilder();
    String line;
    while ((line = reader.readLine()) != null) {
      //process line
      b.append(line);
    }
    return b.toString();
  }

  /**
   * Load the WebView and create the Bridge
   */
  protected void load(Bundle savedInstanceState) {
    Logger.debug("Starting BridgeActivity");

    webView = findViewById(R.id.webview);

    cordovaInterface = new MockCordovaInterfaceImpl(this);
    if (savedInstanceState != null) {
      cordovaInterface.restoreInstanceState(savedInstanceState);
    }

    mockWebView = new MockCordovaWebViewImpl(this.getApplicationContext());
    mockWebView.init(cordovaInterface, pluginEntries, preferences, webView);

    pluginManager = mockWebView.getPluginManager();
    cordovaInterface.onCordovaInit(pluginManager);
    bridge = new Bridge(this, webView, initialPlugins, cordovaInterface, pluginManager, preferences);

    Splash.showOnLaunch(this);

    if (savedInstanceState != null) {
      bridge.restoreInstanceState(savedInstanceState);
    }
    this.keepRunning = preferences.getBoolean("KeepRunning", true);
    this.onNewIntent(getIntent());
  }

  public Bridge getBridge() {
    return this.bridge;
  }

  /**
   * Notify the App plugin that the current state changed
   * @param isActive
   */
  private void fireAppStateChanged(boolean isActive) {
    PluginHandle handle = bridge.getPlugin("App");
    if (handle == null) {
      return;
    }

    App appState = (App) handle.getInstance();
    if (appState != null) {
      appState.fireChange(isActive);
    }
  }

  @Override
  public void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    bridge.saveInstanceState(outState);
  }

  @Override
  public void onStart() {
    super.onStart();

    activityDepth++;

    this.bridge.onStart();
    mockWebView.handleStart();

    Logger.debug("App started");
  }

  @Override
  public void onRestart() {
    super.onRestart();
    this.bridge.onRestart();
    Logger.debug("App restarted");
  }

  @Override
  public void onResume() {
    super.onResume();

    fireAppStateChanged(true);

    this.bridge.onResume();

    mockWebView.handleResume(this.keepRunning);

    Logger.debug("App resumed");
  }

  @Override
  public void onPause() {
    super.onPause();

    this.bridge.onPause();
    if (this.mockWebView != null) {
      boolean keepRunning = this.keepRunning || this.cordovaInterface.getActivityResultCallback() != null;
      this.mockWebView.handlePause(keepRunning);
    }

    Logger.debug("App paused");
  }

  @Override
  public void onStop() {
    super.onStop();

    activityDepth = Math.max(0, activityDepth - 1);
    if (activityDepth == 0) {
      fireAppStateChanged(false);
    }

    this.bridge.onStop();

    if (mockWebView != null) {
      mockWebView.handleStop();
    }

    Logger.debug("App stopped");
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    this.bridge.onDestroy();
    if (this.mockWebView != null) {
      mockWebView.handleDestroy();
    }
    Logger.debug("App destroyed");
  }

  @Override
  public void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    if (webView != null) {
      webView.removeAllViews();
      webView.destroy();
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
    if (this.bridge == null) {
      return;
    }

    this.bridge.onRequestPermissionsResult(requestCode, permissions, grantResults);
  }

  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (this.bridge == null) {
      return;
    }
    this.bridge.onActivityResult(requestCode, resultCode, data);
  }

  @Override
  protected void onNewIntent(Intent intent) {
    if (this.bridge == null || intent == null) {
      return;
    }

    this.bridge.onNewIntent(intent);
    mockWebView.onNewIntent(intent);
  }

  @Override
  public void onBackPressed() {
    if (this.bridge == null) {
      return;
    }

    this.bridge.onBackPressed();
  }

  public void loadConfig(Context context, Activity activity) {
    ConfigXmlParser parser = new ConfigXmlParser();
    parser.parse(context);
    preferences = parser.getPreferences();
    preferences.setPreferencesBundle(activity.getIntent().getExtras());
    pluginEntries = parser.getPluginEntries();
  }
}
