package PACKAGE_NAME;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin
public class CLASS_NAME extends Plugin {
    private CLASS_NAMEFunctionality functionality = new CLASS_NAMEFunctionality();

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");
        call.success(functionality.echo(value));
    }
}
