package com.getcapacitor.plugin;

import com.getcapacitor.Bridge;
import com.getcapacitor.Logger;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.CookieStore;
import java.net.HttpCookie;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

public class CapacitorCookieManager extends CookieManager {

    private final android.webkit.CookieManager webkitCookieManager;

    private final String localUrl;

    private final String serverUrl;

    private final String TAG = "CapacitorCookies";

    /**
     * Create a new cookie manager with the default cookie store and policy
     */
    public CapacitorCookieManager(Bridge bridge) {
        this(null, null, bridge);
    }

    /**
     * Create a new cookie manager with specified cookie store and cookie policy.
     * @param store a {@code CookieStore} to be used by CookieManager. if {@code null}, cookie
     *              manager will use a default one, which is an in-memory CookieStore implementation.
     * @param policy a {@code CookiePolicy} instance to be used by cookie manager as policy
     *               callback. if {@code null}, ACCEPT_ORIGINAL_SERVER will be used.
     */
    public CapacitorCookieManager(CookieStore store, CookiePolicy policy, Bridge bridge) {
        super(store, policy);
        webkitCookieManager = android.webkit.CookieManager.getInstance();
        this.localUrl = bridge.getLocalUrl();
        this.serverUrl = bridge.getServerUrl();
    }

    public void removeSessionCookies() {
        this.webkitCookieManager.removeSessionCookies(null);
    }

    public String getSanitizedDomain(String url) throws URISyntaxException {
        if (url == null || url.isEmpty()) {
            url = this.serverUrl;
        }

        try {
            new URI(url);
        } catch (Exception ignored) {
            url = this.localUrl;

            try {
                new URI(url);
            } catch (Exception error) {
                Logger.error(TAG, "Failed to get sanitized URL.", error);
                throw error;
            }
        }

        return url;
    }

    private String getDomainFromCookieString(String cookie) throws URISyntaxException {
        String[] domain = cookie.toLowerCase(Locale.ROOT).split("domain=");
        return getSanitizedDomain(domain.length <= 1 ? null : domain[1].split(";")[0].trim());
    }

    /**
     * Gets the cookies for the given URL.
     * @param url the URL for which the cookies are requested
     * @return value the cookies as a string, using the format of the 'Cookie' HTTP request header
     */
    public String getCookieString(String url) {
        try {
            url = getSanitizedDomain(url);
            Logger.info(TAG, "Getting cookies at: '" + url + "'");
            return webkitCookieManager.getCookie(url);
        } catch (Exception error) {
            Logger.error(TAG, "Failed to get cookies at the given URL.", error);
        }

        return null;
    }

    /**
     * Gets a cookie value for the given URL and key.
     * @param url the URL for which the cookies are requested
     * @param key the key of the cookie to search for
     * @return the {@code HttpCookie} value of the cookie at the key,
     *         otherwise it will return a new empty {@code HttpCookie}
     */
    public HttpCookie getCookie(String url, String key) {
        HttpCookie[] cookies = getCookies(url);
        for (HttpCookie cookie : cookies) {
            if (cookie.getName().equals(key)) {
                return cookie;
            }
        }

        return null;
    }

    /**
     * Gets an array of {@code HttpCookie} given a URL.
     * @param url the URL for which the cookies are requested
     * @return an {@code HttpCookie} array of non-expired cookies
     */
    public HttpCookie[] getCookies(String url) {
        try {
            ArrayList<HttpCookie> cookieList = new ArrayList<>();
            String cookieString = getCookieString(url);
            if (cookieString != null) {
                String[] singleCookie = cookieString.split(";");
                for (String c : singleCookie) {
                    HttpCookie parsed = HttpCookie.parse(c).get(0);
                    parsed.setValue(parsed.getValue());
                    cookieList.add(parsed);
                }
            }
            HttpCookie[] cookies = new HttpCookie[cookieList.size()];
            return cookieList.toArray(cookies);
        } catch (Exception ex) {
            return new HttpCookie[0];
        }
    }

    /**
     * Sets a cookie for the given URL. Any existing cookie with the same host, path and name will
     *  be replaced with the new cookie. The cookie being set will be ignored if it is expired.
     * @param url the URL for which the cookie is to be set
     * @param value the cookie as a string, using the format of the 'Set-Cookie' HTTP response header
     */
    public void setCookie(String url, String value) {
        try {
            url = getSanitizedDomain(url);
            Logger.info(TAG, "Setting cookie '" + value + "' at: '" + url + "'");
            webkitCookieManager.setCookie(url, value);
            flush();
        } catch (Exception error) {
            Logger.error(TAG, "Failed to set cookie.", error);
        }
    }

    /**
     * Sets a cookie for the given URL. Any existing cookie with the same host, path and name will
     *  be replaced with the new cookie. The cookie being set will be ignored if it is expired.
     * @param url the URL for which the cookie is to be set
     * @param key the {@code HttpCookie} name to use for lookup
     * @param value the value of the {@code HttpCookie} given a key
     */
    public void setCookie(String url, String key, String value) {
        String cookieValue = key + "=" + value;
        setCookie(url, cookieValue);
    }

    public void setCookie(String url, String key, String value, String expires, String path) {
        String cookieValue = key + "=" + value + "; expires=" + expires + "; path=" + path;
        setCookie(url, cookieValue);
    }

    /**
     * Removes all cookies. This method is asynchronous.
     */
    public void removeAllCookies() {
        webkitCookieManager.removeAllCookies(null);
        flush();
    }

    /**
     * Ensures all cookies currently accessible through the getCookie API are written to persistent
     *  storage. This call will block the caller until it is done and may perform I/O.
     */
    public void flush() {
        webkitCookieManager.flush();
    }

    @Override
    public void put(URI uri, Map<String, List<String>> responseHeaders) {
        // make sure our args are valid
        if ((uri == null) || (responseHeaders == null)) return;

        // go over the headers
        for (String headerKey : responseHeaders.keySet()) {
            // ignore headers which aren't cookie related
            if ((headerKey == null) || !(headerKey.equalsIgnoreCase("Set-Cookie2") || headerKey.equalsIgnoreCase("Set-Cookie"))) continue;

            // process each of the headers
            for (String headerValue : Objects.requireNonNull(responseHeaders.get(headerKey))) {
                try {
                    // Set at the requested server url
                    setCookie(uri.toString(), headerValue);

                    // Set at the defined domain in the response or at default capacitor hosted url
                    setCookie(getDomainFromCookieString(headerValue), headerValue);
                } catch (Exception ignored) {}
            }
        }
    }

    @Override
    public Map<String, List<String>> get(URI uri, Map<String, List<String>> requestHeaders) {
        // make sure our args are valid
        if ((uri == null) || (requestHeaders == null)) throw new IllegalArgumentException("Argument is null");

        // save our url once
        String url = uri.toString();

        // prepare our response
        Map<String, List<String>> res = new HashMap<>();

        // get the cookie
        String cookie = getCookieString(url);

        // return it
        if (cookie != null) res.put("Cookie", Collections.singletonList(cookie));
        return res;
    }

    @Override
    public CookieStore getCookieStore() {
        // we don't want anyone to work with this cookie store directly
        throw new UnsupportedOperationException();
    }
}
