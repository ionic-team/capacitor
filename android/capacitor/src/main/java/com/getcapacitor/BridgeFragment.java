package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.res.TypedArray;
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
import java.util.ArrayList;
import java.util.List;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginManager;
import org.json.JSONObject;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link BridgeFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class BridgeFragment extends Fragment {
    private static final String ARG_START_DIR = "startDir";

    private WebView webView;
    protected Bridge bridge;
    protected MockCordovaInterfaceImpl cordovaInterface;
    protected boolean keepRunning = true;
    private ArrayList<PluginEntry> pluginEntries;
    private PluginManager pluginManager;
    private CordovaPreferences preferences;
    private MockCordovaWebViewImpl mockWebView;

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

    public void addPlugin(Class<? extends Plugin> plugin) {
        this.initialPlugins.add(plugin);
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
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
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
    public void onDestroy() {
        super.onDestroy();
        if (this.bridge != null) {
            this.bridge.onDestroy();
        }
        if (this.mockWebView != null) {
            mockWebView.handleDestroy();
        }
    }
}
