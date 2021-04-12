package com.getcapacitor;

import android.content.Context;
import android.content.res.TypedArray;
import android.os.Bundle;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.fragment.app.Fragment;
import com.getcapacitor.android.R;
import java.util.ArrayList;
import java.util.List;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link BridgeFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class BridgeFragment extends Fragment {

    private static final String ARG_START_DIR = "startDir";

    protected Bridge bridge;
    protected boolean keepRunning = true;

    private final List<Class<? extends Plugin>> initialPlugins = new ArrayList<>();
    private CapConfig config = null;

    private final List<WebViewListener> webViewListeners = new ArrayList<>();

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

    public void addPlugin(Class<? extends Plugin> plugin) {
        this.initialPlugins.add(plugin);
    }

    public void setConfig(CapConfig config) {
        this.config = config;
    }

    public Bridge getBridge() {
        return bridge;
    }

    public void addWebViewListener(WebViewListener webViewListener) {
        webViewListeners.add(webViewListener);
    }

    /**
     * Load the WebView and create the Bridge
     */
    protected void load(Bundle savedInstanceState) {
        Logger.debug("Loading Bridge with BridgeFragment");

        Bundle args = getArguments();
        String startDir = null;

        if (args != null) {
            startDir = getArguments().getString(ARG_START_DIR);
        }

        bridge =
            new Bridge.Builder(this)
                .setInstanceState(savedInstanceState)
                .setPlugins(initialPlugins)
                .setConfig(config)
                .addWebViewListeners(webViewListeners)
                .create();

        if (startDir != null) {
            bridge.setServerAssetPath(startDir);
        }

        this.keepRunning = bridge.shouldKeepRunning();
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
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        this.load(savedInstanceState);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (this.bridge != null) {
            this.bridge.onDestroy();
        }
    }
}
