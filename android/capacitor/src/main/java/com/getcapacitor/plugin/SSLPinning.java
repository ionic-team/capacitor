package com.getcapacitor.plugin;

import android.annotation.SuppressLint;
import android.content.res.AssetManager;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

@CapacitorPlugin(
        name = "SSLPinning"
)
public class SSLPinning extends Plugin {
    private final String tag = "SSL Pinning";
    public boolean enabled = false;
    public ArrayList<String> excludedDomains = new ArrayList<>();
    public Map<String, InputStream> certs = new HashMap<>();

    @Override
    public void load() {
        super.load();

        this.enabled = getConfig().getBoolean("enabled", false);
        String[] excludedDomains = getConfig().getArray("excludedDomains");

        if (excludedDomains != null) {
            this.excludedDomains.addAll(Arrays.asList(excludedDomains));
        }

        String[] certs = getConfig().getArray("certs");
        if (certs != null) {
            this.certs = loadCertificates(Arrays.asList(certs));
        }
    }

    public Boolean isDomainExcluded(URL url) {
        if (excludedDomains.isEmpty()) {
            return false;
        }

        Log.i(tag, "Checking Excluded Domains: [" + excludedDomains +"]");

        return excludedDomains.stream().anyMatch(domain -> {
            URL excludedDomainUrl;

            try {
                excludedDomainUrl = new URL(domain);
            } catch (MalformedURLException ignored) {
                excludedDomainUrl = null;
            }

            if (excludedDomainUrl == null) {
                Log.w(tag, "Invalid URL in Excluded Domains: " + domain);
                return false;
            } else if (excludedDomainUrl.getProtocol() == null || excludedDomainUrl.getProtocol().isEmpty()) {
                Log.w(tag, "The excluded domain string needs to include a protocol: " + domain);
                return false;
            } else {
                return Objects.equals(excludedDomainUrl.getHost(), url.getHost()) &&
                        Objects.equals(excludedDomainUrl.getProtocol(), url.getProtocol());
            }
        });
    }

    public SSLSocketFactory getSSLSocketFactory() {
        try {
            if (!certs.isEmpty()) {
                KeyStore keyStore = getKeyStoreInstance();
                TrustManagerFactory trustManagerFactory = getTrustManagerFactoryInstance(keyStore);
                SSLContext sslContext = SSLContext.getInstance("TLS");
                List<String> pinnedPublicKeys = gePublicKeys(keyStore);

                TrustManager[] tms = {new PublicKeyTrustManager(Arrays.asList(trustManagerFactory.getTrustManagers()), pinnedPublicKeys)};
                sslContext.init(null, null, null);
                if (sslContext.getSocketFactory() == null) {
                    Log.w(tag, "Failed to pin any certificates. Performing normal request.");
                } else {
                    Log.i(tag, "Pinned certificates. Executing secure request now.");
                }

                return sslContext.getSocketFactory();
            } else {
                Log.w(tag, "Unable to successfully load any certs. SSL Pinning will be disabled for this request.");
            }
        } catch (Exception ex) {
            Log.e(tag, ex.getMessage());
            ex.printStackTrace();
        }

        return null;
    }

    private KeyStore getKeyStoreInstance() throws Exception {
        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null);

        CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
        for (Map.Entry<String, InputStream> cert : certs.entrySet()) {
            Certificate certificate = certificateFactory.generateCertificate(cert.getValue());
            keyStore.setCertificateEntry("capacitor-ssl-pinning-" + cert.getKey(), certificate);
        }
        return keyStore;
    }

    private TrustManagerFactory getTrustManagerFactoryInstance(KeyStore keyStore) throws Exception {
        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(keyStore);

        return trustManagerFactory;
    }


    private List<String> gePublicKeys(KeyStore keyStore) throws Exception {
        return Stream.of(keyStore.aliases()).map( alias -> {
            Certificate cert = keyStore.getCertificate(alias.toString());
            return Base64.encodeToString(cert.getPublicKey().getEncoded(), Base64.NO_WRAP);
        });
    }

    private Map<String, InputStream> loadCertificates(List<String> certs) {
        if (certs.isEmpty()) {
            Log.w(this.tag, " No certificates configured");
            return new HashMap<>();
        }

        Log.w(this.tag, "Loading certificates: " + certs);

        AssetManager assetManager = bridge.getContext().getResources().getAssets();

        Map<String, InputStream> certList = new HashMap<>();
        for (String cert : certs) {
            String[] components = cert.split("/");
            String fileName = components[components.length - 1];

            try {
                certList.put(fileName, assetManager.open("certs/" + fileName));
                Log.i(this.tag, "Pinned (certs/"  + fileName + ").");
            } catch (Exception ex) {
                Log.e(this.tag, "Certificate not found or could not be loaded: " + ex);
            }
        }

        return certList;
    }

    @SuppressLint("CustomX509TrustManager")
    class PublicKeyTrustManager implements X509TrustManager {
        private final List<TrustManager> defaultTrustManagers;
        private final List<String> pinnedPublicKeys;

        PublicKeyTrustManager(List<TrustManager> defaultTrustManagers, List<String> pinnedPublicKeys) {
            super();
            this.defaultTrustManagers = defaultTrustManagers;
            this.pinnedPublicKeys = pinnedPublicKeys;
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            X509TrustManager firstManager = (X509TrustManager) defaultTrustManagers.get(0);
            return firstManager.getAcceptedIssuers();
        }

        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            X509TrustManager firstManager = (X509TrustManager) defaultTrustManagers.get(0);
            firstManager.checkClientTrusted(chain, authType);
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            String serverPublicKey = Base64.encodeToString(chain[0].getPublicKey().getEncoded(), Base64.NO_WRAP);
            if (pinnedPublicKeys.stream().noneMatch(it -> it == serverPublicKey)) {
                throw new CertificateException("Server's public key is not in the list of pinned keys");
            }
        }
    }
}
