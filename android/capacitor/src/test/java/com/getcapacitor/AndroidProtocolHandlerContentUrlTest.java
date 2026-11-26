package com.getcapacitor;

import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedStatic;

public class AndroidProtocolHandlerContentUrlTest {

    private MockedStatic<Uri> uriStatic;
    private MockedStatic<Logger> loggerStatic;
    private ContentResolver resolver;
    private AndroidProtocolHandler handler;
    private Uri requestUri;

    @Before
    public void setUp() {
        Uri contentUri = mock(Uri.class);
        requestUri = mock(Uri.class);
        when(requestUri.getScheme()).thenReturn("https");
        when(requestUri.getHost()).thenReturn("localhost");
        when(requestUri.getPort()).thenReturn(-1);
        when(requestUri.toString()).thenReturn("https://localhost/_capacitor_content_/app.fileprovider/x");

        uriStatic = mockStatic(Uri.class);
        uriStatic.when(() -> Uri.parse("content://app.fileprovider/x")).thenReturn(contentUri);
        loggerStatic = mockStatic(Logger.class);

        resolver = mock(ContentResolver.class);
        Context context = mock(Context.class);
        when(context.getContentResolver()).thenReturn(resolver);
        handler = new AndroidProtocolHandler(context);
    }

    @After
    public void tearDown() {
        loggerStatic.close();
        uriStatic.close();
    }

    @Test
    public void returnsTheProviderStream() throws IOException {
        InputStream stream = mock(InputStream.class);
        when(resolver.openInputStream(any(Uri.class))).thenReturn(stream);
        assertSame(stream, handler.openContentUrl(requestUri));
    }

    @Test
    public void returnsNullWhenProviderRejectsThePathWithIllegalArgumentException() throws IOException {
        // androidx FileProvider: "Unable to find configured root for ..." / "Unable to find path from root: ..."
        when(resolver.openInputStream(any(Uri.class))).thenThrow(new IllegalArgumentException("Unable to find configured root"));
        assertNull(handler.openContentUrl(requestUri));
    }

    @Test
    public void returnsNullWhenProviderThrowsStringIndexOutOfBounds() throws IOException {
        // older androidx FileProvider on a path without a second segment
        when(resolver.openInputStream(any(Uri.class))).thenThrow(new StringIndexOutOfBoundsException("begin 1, end -1, length 2"));
        assertNull(handler.openContentUrl(requestUri));
    }

    @Test
    public void returnsNullOnSecurityException() throws IOException {
        when(resolver.openInputStream(any(Uri.class))).thenThrow(new SecurityException("denied"));
        assertNull(handler.openContentUrl(requestUri));
    }

    @Test
    public void stillPropagatesFileNotFound() throws IOException {
        when(resolver.openInputStream(any(Uri.class))).thenThrow(new FileNotFoundException("missing"));
        assertThrows(FileNotFoundException.class, () -> handler.openContentUrl(requestUri));
    }
}
