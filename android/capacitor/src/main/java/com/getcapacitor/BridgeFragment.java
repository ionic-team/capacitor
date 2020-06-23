package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.res.TypedArray;
import android.net.Uri;
import android.os.Bundle;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;

import androidx.fragment.app.Fragment;

import com.getcapacitor.android.R;
import com.getcapacitor.cordova.MockCordovaInterfaceImpl;
import com.getcapacitor.cordova.MockCordovaWebViewImpl;

import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link BridgeFragment.OnFragmentInteractionListener} interface
 * to handle interaction events.
 * Use the {@link BridgeFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class BridgeFragment extends Fragment {
  private static final String ARG_START_DIR = "startDir";

  private String startDir;

  private OnFragmentInteractionListener mListener;

  private WebView webView;
  protected Bridge bridge;
  protected MockCordovaInterfaceImpl cordovaInterface;
  protected boolean keepRunning = true;
  private ArrayList<PluginEntry> pluginEntries;
  private PluginManager pluginManager;
  private CordovaPreferences preferences;
  private MockCordovaWebViewImpl mockWebView;
  private int activityDepth = 0;
  private String bridgeStartDir;

  private String lastActivityPlugin;

  private List<Class<? extends Plugin>> initialPlugins = new ArrayList<>();
  private JSONObject config = new JSONObject();

  public BridgeFragment() {
    // Required empty public constructor
  }

  /**
   * Use this factory method to create a new instance of
   * this fragment using the provided parameters.
   *
   * @param startDir the directory to serve content from
   * @return A new instance of fragment BridgeFragment.
   */
  public static BridgeFragment newInstance(String startDir) {
    BridgeFragment fragment = new BridgeFragment();
    Bundle args = new Bundle();
    args.putString(ARG_START_DIR, startDir);
    fragment.setArguments(args);
    return fragment;
  }

  protected void init(Bundle savedInstanceState) {
    loadConfig(this.getActivity().getApplicationContext(), this.getActivity());
  }

  /**
   * Load the WebView and create the Bridge
   */
  protected void load(Bundle savedInstanceState) {
    Logger.debug("Starting BridgeActivity");

    Bundle args = getArguments();
    String startDir = null;

    if (args != null) {
      startDir = getArguments().getString(ARG_START_DIR);
    }

    webView = getView().findViewById(R.id.webview);
    cordovaInterface = new MockCordovaInterfaceImpl(this.getActivity());
    if (savedInstanceState != null) {
      cordovaInterface.restoreInstanceState(savedInstanceState);
    }

    mockWebView = new MockCordovaWebViewImpl(getActivity().getApplicationContext());
    mockWebView.init(cordovaInterface, pluginEntries, preferences, webView);

    pluginManager = mockWebView.getPluginManager();
    cordovaInterface.onCordovaInit(pluginManager);

    if (preferences == null) {
      preferences = new CordovaPreferences();
    }

    bridge = new Bridge(this.getActivity(), webView, initialPlugins, cordovaInterface, pluginManager, preferences, config);

    if (startDir != null) {
      bridge.setServerAssetPath(startDir);
    }

    if (savedInstanceState != null) {
      bridge.restoreInstanceState(savedInstanceState);
    }
    this.keepRunning = preferences.getBoolean("KeepRunning", true);
  }

  public void loadConfig(Context context, Activity activity) {
    ConfigXmlParser parser = new ConfigXmlParser();
    parser.parse(context);
    preferences = parser.getPreferences();
    preferences.setPreferencesBundle(activity.getIntent().getExtras());
    pluginEntries = parser.getPluginEntries();
  }


  @Override
  public void onInflate(Context context, AttributeSet attrs, Bundle savedInstanceState) {
    super.onInflate(context, attrs, savedInstanceState);

    TypedArray a = context.obtainStyledAttributes(attrs, R.styleable.bridge_fragment);
    CharSequence c = a.getString(R.styleable.bridge_fragment_start_dir);

    if (c != null) {
      String startDir = c.toString();
      Bundle args = new Bundle();
      args.putString(ARG_START_DIR, startDir);
      setArguments(args);
    }
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
  }

  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container,
                           Bundle savedInstanceState) {
    // Inflate the layout for this fragment
    return inflater.inflate(R.layout.fragment_bridge, container, false);
  }

  @Override
  public void onActivityCreated(Bundle savedInstanceState) {
    super.onActivityCreated(savedInstanceState);
    this.init(savedInstanceState);
    this.load(savedInstanceState);
  }

  @Override
  public void onAttach(Context context) {
    super.onAttach(context);
    if (context instanceof OnFragmentInteractionListener) {
      mListener = (OnFragmentInteractionListener) context;
    } else {
      throw new RuntimeException(context.toString()
        + " must implement OnFragmentInteractionListener");
    }
  }

  @Override
  public void onDetach() {
    super.onDetach();
    mListener = null;
  }

  /**
   * This interface must be implemented by activities that contain this
   * fragment to allow an interaction in this fragment to be communicated
   * to the activity and potentially other fragments contained in that
   * activity.
   * <p>
   * See the Android Training lesson <a href=
   * "http://developer.android.com/training/basics/fragments/communicating.html"
   * >Communicating with Other Fragments</a> for more information.
   */
  public interface OnFragmentInteractionListener {
    void onFragmentInteraction(Uri uri);
  }
}
