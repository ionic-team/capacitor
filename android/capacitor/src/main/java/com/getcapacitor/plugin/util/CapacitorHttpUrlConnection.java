package com.getcapacitor.plugin.util;

import android.os.Build;
import android.os.LocaleList;
import android.text.TextUtils;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSValue;
import com.getcapacitor.PluginCall;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.URLEncoder;
import java.net.UnknownServiceException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSocketFactory;
import org.json.JSONException;
import org.json.JSONObject;

public class CapacitorHttpUrlConnection implements ICapacitorHttpUrlConnection {

    private final HttpURLConnection connection;

    /**
     * Make a new CapacitorHttpUrlConnection instance, which wraps around HttpUrlConnection
     * and provides some helper functions for setting request headers and the request body
     * @param conn the base HttpUrlConnection. You can pass the value from
     *             {@code (HttpUrlConnection) URL.openConnection()}
     */
    public CapacitorHttpUrlConnection(HttpURLConnection conn) {
        connection = conn;
        this.setDefaultRequestProperties();
    }

    /**
     * Returns the underlying HttpUrlConnection value
     * @return the underlying HttpUrlConnection value
     */
    public HttpURLConnection getHttpConnection() {
        return connection;
    }

    public void disconnect() {
        connection.disconnect();
    }

    /**
     * Set the value of the {@code allowUserInteraction} field of
     * this {@code URLConnection}.
     *
     * @param   isAllowedInteraction   the new value.
     * @throws IllegalStateException if already connected
     */
    public void setAllowUserInteraction(boolean isAllowedInteraction) {
        connection.setAllowUserInteraction(isAllowedInteraction);
    }

    /**
     * Set the method for the URL request, one of:
     * <UL>
     *  <LI>GET
     *  <LI>POST
     *  <LI>HEAD
     *  <LI>OPTIONS
     *  <LI>PUT
     *  <LI>DELETE
     *  <LI>TRACE
     * </UL> are legal, subject to protocol restrictions.  The default
     * method is GET.
     *
     * @param method the HTTP method
     * @exception ProtocolException if the method cannot be reset or if
     *              the requested method isn't valid for HTTP.
     * @exception SecurityException if a security manager is set and the
     *              method is "TRACE", but the "allowHttpTrace"
     *              NetPermission is not granted.
     */
    public void setRequestMethod(String method) throws ProtocolException {
        connection.setRequestMethod(method);
    }

    /**
     * Sets a specified timeout value, in milliseconds, to be used
     * when opening a communications link to the resource referenced
     * by this URLConnection.  If the timeout expires before the
     * connection can be established, a
     * java.net.SocketTimeoutException is raised. A timeout of zero is
     * interpreted as an infinite timeout.
     *
     * <p><strong>Warning</strong>: If the hostname resolves to multiple IP
     * addresses, Android's default implementation of {@link HttpURLConnection}
     * will try each in
     * <a href="http://www.ietf.org/rfc/rfc3484.txt">RFC 3484</a> order. If
     * connecting to each of these addresses fails, multiple timeouts will
     * elapse before the connect attempt throws an exception. Host names
     * that support both IPv6 and IPv4 always have at least 2 IP addresses.
     *
     * @param timeout an {@code int} that specifies the connect
     *               timeout value in milliseconds
     * @throws IllegalArgumentException if the timeout parameter is negative
     */
    public void setConnectTimeout(int timeout) {
        if (timeout < 0) {
            throw new IllegalArgumentException("timeout can not be negative");
        }
        connection.setConnectTimeout(timeout);
    }

    /**
     * Sets the read timeout to a specified timeout, in
     * milliseconds. A non-zero value specifies the timeout when
     * reading from Input stream when a connection is established to a
     * resource. If the timeout expires before there is data available
     * for read, a java.net.SocketTimeoutException is raised. A
     * timeout of zero is interpreted as an infinite timeout.
     *
     * @param timeout an {@code int} that specifies the timeout
     * value to be used in milliseconds
     * @throws IllegalArgumentException if the timeout parameter is negative
     */
    public void setReadTimeout(int timeout) {
        if (timeout < 0) {
            throw new IllegalArgumentException("timeout can not be negative");
        }
        connection.setReadTimeout(timeout);
    }

    /**
     * Sets whether automatic HTTP redirects should be disabled
     * @param disableRedirects the flag to determine if redirects should be followed
     */
    public void setDisableRedirects(boolean disableRedirects) {
        connection.setInstanceFollowRedirects(!disableRedirects);
    }

    /**
     * Sets the request headers given a JSObject of key-value pairs
     * @param headers the JSObject values to map to the HttpUrlConnection request headers
     */
    public void setRequestHeaders(JSObject headers) {
        Iterator<String> keys = headers.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            String value = headers.getString(key);
            connection.setRequestProperty(key, value);
        }
    }

    /**
     * Sets the value of the {@code doOutput} field for this
     * {@code URLConnection} to the specified value.
     * <p>
     * A URL connection can be used for input and/or output.  Set the DoOutput
     * flag to true if you intend to use the URL connection for output,
     * false if not.  The default is false.
     *
     * @param  shouldDoOutput   the new value.
     * @throws IllegalStateException if already connected
     */
    public void setDoOutput(boolean shouldDoOutput) {
        connection.setDoOutput(shouldDoOutput);
    }

    /**
     *
     * @param call
     * @throws JSONException
     * @throws IOException
     */
    public void setRequestBody(PluginCall call, JSValue body) throws JSONException, IOException {
        setRequestBody(call, body, null);
    }

    /**
     *
     * @param call
     * @throws JSONException
     * @throws IOException
     */
    public void setRequestBody(PluginCall call, JSValue body, String bodyType) throws JSONException, IOException {
        String contentType = connection.getRequestProperty("Content-Type");
        String dataString = "";

        if (contentType == null || contentType.isEmpty()) return;

        if (contentType.contains("application/json")) {
            JSArray jsArray = null;
            if (body != null) {
                dataString = body.toString();
            } else {
                jsArray = call.getArray("data", null);
            }
            if (jsArray != null) {
                dataString = jsArray.toString();
            } else if (body == null) {
                dataString = call.getString("data");
            }
            this.writeRequestBody(dataString != null ? dataString : "");
        } else if (bodyType != null && bodyType.equals("file")) {
            try (DataOutputStream os = new DataOutputStream(connection.getOutputStream())) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    os.write(Base64.getDecoder().decode(body.toString()));
                }
                os.flush();
            }
        } else if (contentType.contains("application/x-www-form-urlencoded")) {
            try {
                JSObject obj = body.toJSObject();
                this.writeObjectRequestBody(obj);
            } catch (Exception e) {
                // Body is not a valid JSON, treat it as an already formatted string
                this.writeRequestBody(body.toString());
            }
        } else if (bodyType != null && bodyType.equals("formData")) {
            this.writeFormDataRequestBody(contentType, body.toJSArray());
        } else {
            this.writeRequestBody(body.toString());
        }
    }

    /**
     * Writes the provided string to the HTTP connection managed by this instance.
     *
     * @param body The string value to write to the connection stream.
     */
    private void writeRequestBody(String body) throws IOException {
        try (DataOutputStream os = new DataOutputStream(connection.getOutputStream())) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
            os.flush();
        }
    }

    private void writeObjectRequestBody(JSObject object) throws IOException, JSONException {
        try (DataOutputStream os = new DataOutputStream(connection.getOutputStream())) {
            Iterator<String> keys = object.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                Object d = object.get(key);
                os.writeBytes(URLEncoder.encode(key, "UTF-8"));
                os.writeBytes("=");
                os.writeBytes(URLEncoder.encode(d.toString(), "UTF-8"));

                if (keys.hasNext()) {
                    os.writeBytes("&");
                }
            }
            os.flush();
        }
    }

    private void writeFormDataRequestBody(String contentType, JSArray entries) throws IOException, JSONException {
        try (DataOutputStream os = new DataOutputStream(connection.getOutputStream())) {
            String boundary = contentType.split(";")[1].split("=")[1];
            String lineEnd = "\r\n";
            String twoHyphens = "--";

            for (Object e : entries.toList()) {
                if (e instanceof JSONObject) {
                    JSONObject entry = (JSONObject) e;
                    String type = entry.getString("type");
                    String key = entry.getString("key");
                    String value = entry.getString("value");
                    if (type.equals("string")) {
                        os.writeBytes(twoHyphens + boundary + lineEnd);
                        os.writeBytes("Content-Disposition: form-data; name=\"" + key + "\"" + lineEnd + lineEnd);
                        os.write(value.getBytes(StandardCharsets.UTF_8));
                        os.writeBytes(lineEnd);
                    } else if (type.equals("base64File")) {
                        String fileName = entry.getString("fileName");
                        String fileContentType = entry.getString("contentType");

                        os.writeBytes(twoHyphens + boundary + lineEnd);
                        os.writeBytes("Content-Disposition: form-data; name=\"" + key + "\"; filename=\"" + fileName + "\"" + lineEnd);
                        os.writeBytes("Content-Type: " + fileContentType + lineEnd);
                        os.writeBytes("Content-Transfer-Encoding: binary" + lineEnd);
                        os.writeBytes(lineEnd);

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            os.write(Base64.getDecoder().decode(value));
                        } else {
                            os.write(android.util.Base64.decode(value, android.util.Base64.DEFAULT));
                        }

                        os.writeBytes(lineEnd);
                    }
                }
            }

            os.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd);
            os.flush();
        }
    }

    /**
     * Opens a communications link to the resource referenced by this
     * URL, if such a connection has not already been established.
     * <p>
     * If the {@code connect} method is called when the connection
     * has already been opened (indicated by the {@code connected}
     * field having the value {@code true}), the call is ignored.
     * <p>
     * URLConnection objects go through two phases: first they are
     * created, then they are connected.  After being created, and
     * before being connected, various options can be specified
     * (e.g., doInput and UseCaches).  After connecting, it is an
     * error to try to set them.  Operations that depend on being
     * connected, like getContentLength, will implicitly perform the
     * connection, if necessary.
     *
     * @throws SocketTimeoutException if the timeout expires before
     *               the connection can be established
     * @exception  IOException  if an I/O error occurs while opening the
     *               connection.
     */
    public void connect() throws IOException {
        connection.connect();
    }

    /**
     * Gets the status code from an HTTP response message.
     * For example, in the case of the following status lines:
     * <PRE>
     * HTTP/1.0 200 OK
     * HTTP/1.0 401 Unauthorized
     * </PRE>
     * It will return 200 and 401 respectively.
     * Returns -1 if no code can be discerned
     * from the response (i.e., the response is not valid HTTP).
     * @throws IOException if an error occurred connecting to the server.
     * @return the HTTP Status-Code, or -1
     */
    public int getResponseCode() throws IOException {
        return connection.getResponseCode();
    }

    /**
     * Returns the value of this {@code URLConnection}'s {@code URL}
     * field.
     *
     * @return  the value of this {@code URLConnection}'s {@code URL}
     *          field.
     */
    public URL getURL() {
        return connection.getURL();
    }

    /**
     * Returns the error stream if the connection failed
     * but the server sent useful data nonetheless. The
     * typical example is when an HTTP server responds
     * with a 404, which will cause a FileNotFoundException
     * to be thrown in connect, but the server sent an HTML
     * help page with suggestions as to what to do.
     *
     * <p>This method will not cause a connection to be initiated.  If
     * the connection was not connected, or if the server did not have
     * an error while connecting or if the server had an error but
     * no error data was sent, this method will return null. This is
     * the default.
     *
     * @return an error stream if any, null if there have been no
     * errors, the connection is not connected or the server sent no
     * useful data.
     */
    @Override
    public InputStream getErrorStream() {
        return connection.getErrorStream();
    }

    /**
     * Returns the value of the named header field.
     * <p>
     * If called on a connection that sets the same header multiple times
     * with possibly different values, only the last value is returned.
     *
     *
     * @param   name   the name of a header field.
     * @return  the value of the named header field, or {@code null}
     *          if there is no such field in the header.
     */
    @Override
    public String getHeaderField(String name) {
        return connection.getHeaderField(name);
    }

    /**
     * Returns an input stream that reads from this open connection.
     *
     * A SocketTimeoutException can be thrown when reading from the
     * returned input stream if the read timeout expires before data
     * is available for read.
     *
     * @return     an input stream that reads from this open connection.
     * @exception  IOException              if an I/O error occurs while
     *               creating the input stream.
     * @exception UnknownServiceException  if the protocol does not support
     *               input.
     * @see #setReadTimeout(int)
     */
    @Override
    public InputStream getInputStream() throws IOException {
        return connection.getInputStream();
    }

    /**
     * Returns an unmodifiable Map of the header fields.
     * The Map keys are Strings that represent the
     * response-header field names. Each Map value is an
     * unmodifiable List of Strings that represents
     * the corresponding field values.
     *
     * @return a Map of header fields
     */
    public Map<String, List<String>> getHeaderFields() {
        return connection.getHeaderFields();
    }

    /**
     * Sets the default request properties on the newly created connection.
     * This is called as early as possible to allow overrides by user-provided values.
     */
    private void setDefaultRequestProperties() {
        String acceptLanguage = buildDefaultAcceptLanguageProperty();
        if (!TextUtils.isEmpty(acceptLanguage)) {
            connection.setRequestProperty("Accept-Language", acceptLanguage);
        }
    }

    /**
     * Builds and returns a locale string describing the device's current locale preferences.
     */
    private String buildDefaultAcceptLanguageProperty() {
        Locale locale;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            locale = LocaleList.getDefault().get(0);
        } else {
            locale = Locale.getDefault();
        }
        String result = "";
        String lang = locale.getLanguage();
        String country = locale.getCountry();
        if (!TextUtils.isEmpty(lang)) {
            if (!TextUtils.isEmpty(country)) {
                result = String.format("%s-%s,%s;q=0.5", lang, country, lang);
            } else {
                result = String.format("%s;q=0.5", lang);
            }
        }
        return result;
    }

    public void setSSLSocketFactory(Bridge bridge) {
        // Attach SSL Certificates if Enterprise Plugin is available
        try {
            Class<?> sslPinningImpl = Class.forName("io.ionic.sslpinning.SSLPinning");
            Method method = sslPinningImpl.getDeclaredMethod("getSSLSocketFactory", Bridge.class);
            SSLSocketFactory sslSocketFactory = (SSLSocketFactory) method.invoke(
                sslPinningImpl.getDeclaredConstructor().newInstance(),
                bridge
            );
            if (sslSocketFactory != null) {
                ((HttpsURLConnection) this.connection).setSSLSocketFactory(sslSocketFactory);
            }
        } catch (Exception ignored) {}
    }
}
