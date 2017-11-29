package com.example.adam.example;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.webkit.WebView;
import com.avocadojs.Avocado;
import com.avocadojs.plugin.device.DevicePlugin;


public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView webView = findViewById(R.id.webview);
        Avocado avocado = new Avocado(this, webView);

        DevicePlugin devicePlugin = new DevicePlugin(avocado);
        avocado.addPlugin(devicePlugin);
    }

}
