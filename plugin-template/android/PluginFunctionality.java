package PACKAGE_NAME;

import com.getcapacitor.JSObject;

public class CLASS_NAMEFunctionality {

    public JSObject echo(String value) {
        JSObject ret = new JSObject();
        ret.put("value", value);
        return ret;
    }
}
