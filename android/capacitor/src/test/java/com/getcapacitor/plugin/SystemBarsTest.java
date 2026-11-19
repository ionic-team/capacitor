package com.getcapacitor.plugin;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.view.View;
import android.view.Window;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
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

    @Test
    public void bottomInsetIsNavigationBarWhenKeyboardHidden() throws Exception {
        assertEquals(126, invokeGetBottomInset(126, 0, false));
    }

    @Test
    public void bottomInsetIsZeroWhenDockedKeyboardCoversNavigationBar() throws Exception {
        assertEquals(0, invokeGetBottomInset(126, 883, true));
    }

    @Test
    public void bottomInsetIsZeroWhenKeyboardInsetEqualsNavigationBar() throws Exception {
        assertEquals(0, invokeGetBottomInset(126, 126, true));
    }

    @Test
    public void bottomInsetIsUncoveredPartWhenKeyboardPartiallyCoversNavigationBar() throws Exception {
        assertEquals(76, invokeGetBottomInset(126, 50, true));
    }

    @Test
    public void bottomInsetIsNavigationBarWhenFloatingKeyboardCoversNothing() throws Exception {
        assertEquals(63, invokeGetBottomInset(63, 0, true));
    }

    private int invokeGetBottomInset(int navigationBarBottom, int imeBottom, boolean keyboardVisible) throws Exception {
        Method getBottomInset = SystemBars.class.getDeclaredMethod("getBottomInset", Insets.class, Insets.class, boolean.class);
        getBottomInset.setAccessible(true);
        return (int) getBottomInset.invoke(
            new SystemBars(),
            Insets.of(0, 0, 0, navigationBarBottom),
            Insets.of(0, 0, 0, imeBottom),
            keyboardVisible
        );
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
