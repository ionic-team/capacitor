package com.getcapacitor

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.getcapacitor.android.R
import android.content.Intent
import android.content.res.Configuration
import java.util.ArrayList

open class BridgeActivity : AppCompatActivity() {
    var bridge: Bridge? = null
        protected set
    protected var keepRunning = true
    private var config: CapConfig? = null
    private var activityDepth = 0
    private var initialPlugins: List<Class<out Plugin?>> = ArrayList()
    private val bridgeBuilder = Bridge.Builder(this)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        bridgeBuilder.setInstanceState(savedInstanceState)
        application.setTheme(resources.getIdentifier("AppTheme_NoActionBar", "style", packageName))
        setTheme(resources.getIdentifier("AppTheme_NoActionBar", "style", packageName))
        setTheme(R.style.AppTheme_NoActionBar)
        setContentView(R.layout.bridge_layout_main)
    }

    /**
     * Initializes the Capacitor Bridge with the Activity.
     * @param plugins A list of plugins to initialize with Capacitor
     */
    @Deprecated("""It is preferred not to call this method. If it is not called, the bridge is
      initialized automatically. If you need to add additional plugins during initialization,
      use {@link #registerPlugin(Class)} or {@link #registerPlugins(List)}.
     
      """)
    protected fun init(savedInstanceState: Bundle?, plugins: List<Class<out Plugin?>>) {
        this.init(savedInstanceState, plugins, null)
    }

    /**
     * Initializes the Capacitor Bridge with the Activity.
     * @param plugins A list of plugins to initialize with Capacitor
     * @param config An instance of a Capacitor Configuration to use. If null, will load from file
     */
    @Deprecated("""It is preferred not to call this method. If it is not called, the bridge is
      initialized automatically. If you need to add additional plugins during initialization,
      use {@link #registerPlugin(Class)} or {@link #registerPlugins(List)}.
     
      """)
    protected fun init(savedInstanceState: Bundle?, plugins: List<Class<out Plugin?>>, config: CapConfig?) {
        initialPlugins = plugins
        this.config = config
        this.load()
    }

    @Deprecated("This method should not be called manually.")
    protected fun load(savedInstanceState: Bundle?) {
        this.load()
    }

    private fun load() {
        Logger.debug("Starting BridgeActivity")
        bridge = bridgeBuilder.addPlugins(initialPlugins).setConfig(config).create()
        keepRunning = bridge!!.shouldKeepRunning()
        onNewIntent(intent)
    }

    fun registerPlugin(plugin: Class<out Plugin?>?) {
        bridgeBuilder.addPlugin(plugin!!)
    }

    fun registerPlugins(plugins: List<Class<out Plugin>>) {
        bridgeBuilder.addPlugins(plugins)
    }

    public override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        bridge!!.saveInstanceState(outState)
    }

    public override fun onStart() {
        super.onStart()

        // Preferred behavior: init() was not called, so we construct the bridge with auto-loaded plugins.
        if (bridge == null) {
            val loader = PluginManager(assets)
            try {
                bridgeBuilder.addPlugins(loader.loadPluginClasses())
            } catch (ex: PluginLoadException) {
                Logger.error("Error loading plugins.", ex)
            }
            this.load()
        }
        activityDepth++
        bridge!!.onStart()
        Logger.debug("App started")
    }

    public override fun onRestart() {
        super.onRestart()
        bridge!!.onRestart()
        Logger.debug("App restarted")
    }

    public override fun onResume() {
        super.onResume()
        bridge!!.app.fireStatusChange(true)
        bridge!!.onResume()
        Logger.debug("App resumed")
    }

    public override fun onPause() {
        super.onPause()
        bridge!!.onPause()
        Logger.debug("App paused")
    }

    public override fun onStop() {
        super.onStop()
        activityDepth = Math.max(0, activityDepth - 1)
        if (activityDepth == 0) {
            bridge!!.app.fireStatusChange(false)
        }
        bridge!!.onStop()
        Logger.debug("App stopped")
    }

    public override fun onDestroy() {
        super.onDestroy()
        bridge!!.onDestroy()
        Logger.debug("App destroyed")
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        bridge!!.onDetachedFromWindow()
    }

    /**
     * Handles permission request results.
     *
     * Capacitor is backwards compatible such that plugins using legacy permission request codes
     * may coexist with plugins using the AndroidX Activity v1.2 permission callback flow introduced
     * in Capacitor 3.0.
     *
     * In this method, plugins are checked first for ownership of the legacy permission request code.
     * If the [Bridge.onRequestPermissionsResult] method indicates it has
     * handled the permission, then the permission callback will be considered complete. Otherwise,
     * the permission will be handled using the AndroidX Activity flow.
     *
     * @param requestCode the request code associated with the permission request
     * @param permissions the Android permission strings requested
     * @param grantResults the status result of the permission request
     */
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        if (bridge == null) {
            return
        }
        if (!bridge!!.onRequestPermissionsResult(requestCode, permissions, grantResults)) {
            super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        }
    }

    /**
     * Handles activity results.
     *
     * Capacitor is backwards compatible such that plugins using legacy activity result codes
     * may coexist with plugins using the AndroidX Activity v1.2 activity callback flow introduced
     * in Capacitor 3.0.
     *
     * In this method, plugins are checked first for ownership of the legacy request code. If the
     * [Bridge.onActivityResult] method indicates it has handled the activity
     * result, then the callback will be considered complete. Otherwise, the result will be handled
     * using the AndroidX Activiy flow.
     *
     * @param requestCode the request code associated with the activity result
     * @param resultCode the result code
     * @param data any data included with the activity result
     */
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (bridge == null) {
            return
        }
        if (!bridge!!.onActivityResult(requestCode, resultCode, data)) {
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (bridge == null || intent == null) {
            return
        }
        bridge!!.onNewIntent(intent)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        if (bridge == null) {
            return
        }
        bridge!!.onConfigurationChanged(newConfig)
    }
}