package com.getcapacitor.plugin;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.view.View;
import android.view.Window;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Bridge;
import java.lang.reflect.Method;
import org.junit.Test;
import org.mockito.MockedStatic;

public class SystemBarsTest {

    @Test
    public void showWithEmptyBarShowsSystemBars() throws Exception {
        WindowInsetsControllerCompat controller = invokeSetHidden("");

        verify(controller).show(WindowInsetsCompat.Type.systemBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.statusBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.navigationBars());
    }

    @Test
    public void showWithStatusBarShowsOnlyStatusBars() throws Exception {
        WindowInsetsControllerCompat controller = invokeSetHidden("StatusBar");

        verify(controller).show(WindowInsetsCompat.Type.statusBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.systemBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.navigationBars());
    }

    @Test
    public void showWithNavigationBarShowsOnlyNavigationBars() throws Exception {
        WindowInsetsControllerCompat controller = invokeSetHidden("NavigationBar");

        verify(controller).show(WindowInsetsCompat.Type.navigationBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.systemBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.statusBars());
    }

    private WindowInsetsControllerCompat invokeSetHidden(String bar) throws Exception {
        SystemBars plugin = new SystemBars();
        Bridge bridge = mock(Bridge.class);
        AppCompatActivity activity = mock(AppCompatActivity.class);
        Window window = mock(Window.class);
        View decorView = mock(View.class);
        WindowInsetsControllerCompat controller = mock(WindowInsetsControllerCompat.class);

        when(bridge.getActivity()).thenReturn(activity);
        when(activity.getWindow()).thenReturn(window);
        when(window.getDecorView()).thenReturn(decorView);

        plugin.setBridge(bridge);

        try (MockedStatic<WindowCompat> windowCompat = mockStatic(WindowCompat.class)) {
            windowCompat.when(() -> WindowCompat.getInsetsController(window, decorView)).thenReturn(controller);

            Method setHidden = SystemBars.class.getDeclaredMethod("setHidden", boolean.class, String.class);
            setHidden.setAccessible(true);
            setHidden.invoke(plugin, false, bar);
        }

        return controller;
    }
}
