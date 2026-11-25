package com.getcapacitor;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import android.content.Context;
import android.os.Environment;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.mockito.MockedStatic;

public class AndroidProtocolHandlerTest {

    @Rule
    public TemporaryFolder temp = new TemporaryFolder();

    private MockedStatic<Environment> environment;
    private AndroidProtocolHandler handler;
    private File filesDir;
    private File cacheDir;
    private File sharedStorage;
    private File sdCard;
    private File privateDir;

    @Before
    public void setUp() throws IOException {
        File app = temp.newFolder("data", "pkg");
        filesDir = new File(app, "files");
        cacheDir = new File(app, "cache");
        privateDir = new File(app, "shared_prefs");
        sharedStorage = temp.newFolder("storage", "emulated", "0");
        sdCard = temp.newFolder("storage", "ABCD-1234");
        File sdAppDir = new File(sdCard, "Android/data/pkg/files");
        filesDir.mkdirs();
        cacheDir.mkdirs();
        privateDir.mkdirs();
        sdAppDir.mkdirs();

        Context context = mock(Context.class);
        when(context.getApplicationContext()).thenReturn(context);
        when(context.getFilesDir()).thenReturn(filesDir);
        when(context.getCacheDir()).thenReturn(cacheDir);
        when(context.getExternalFilesDirs(null)).thenReturn(new File[] { new File(sharedStorage, "Android/data/pkg/files"), sdAppDir });
        when(context.getExternalCacheDirs()).thenReturn(new File[] { null });

        environment = mockStatic(Environment.class);
        environment.when(Environment::getExternalStorageDirectory).thenReturn(sharedStorage);

        handler = new AndroidProtocolHandler(context);
    }

    @After
    public void tearDown() {
        environment.close();
    }

    private String write(File dir, String name, String content) throws IOException {
        File file = new File(dir, name);
        Files.write(file.toPath(), content.getBytes(StandardCharsets.UTF_8));
        return file.getAbsolutePath();
    }

    private String read(String proxyPath) throws IOException {
        try (InputStream in = handler.openProxiedFile(proxyPath)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    public void servesFilesFromAppFilesAndCache() throws IOException {
        assertEquals("a", read(Bridge.CAPACITOR_FILE_START + write(filesDir, "a.txt", "a")));
        assertEquals("b", read(Bridge.CAPACITOR_FILE_START + write(cacheDir, "b.txt", "b")));
    }

    @Test
    public void servesFilesFromSharedStorageAndOtherVolumes() throws IOException {
        assertEquals("c", read(Bridge.CAPACITOR_FILE_START + write(sharedStorage, "c.txt", "c")));
        assertEquals("d", read(Bridge.CAPACITOR_FILE_START + write(sdCard, "d.txt", "d")));
    }

    @Test
    public void rejectsAppPrivateDirectoriesOutsideFilesAndCache() throws IOException {
        String prefs = write(privateDir, "CapacitorStorage.xml", "secret");
        assertThrows(IOException.class, () -> read(Bridge.CAPACITOR_FILE_START + prefs));
    }

    @Test
    public void rejectsSystemPaths() {
        assertThrows(IOException.class, () -> read(Bridge.CAPACITOR_FILE_START + "/etc/hosts"));
        assertThrows(IOException.class, () -> read(Bridge.CAPACITOR_FILE_START + "/proc/self/cmdline"));
    }

    @Test
    public void rejectsTraversalOutOfAllowedRoot() throws IOException {
        String prefs = write(privateDir, "x.xml", "secret");
        String traversal = filesDir.getAbsolutePath() + "/../shared_prefs/x.xml";
        assertThrows(IOException.class, () -> read(Bridge.CAPACITOR_FILE_START + traversal));
        assertEquals("secret", new String(Files.readAllBytes(new File(prefs).toPath()), StandardCharsets.UTF_8));
    }

    @Test
    public void rejectsSymlinkPointingOutsideAllowedRoot() throws IOException {
        String prefs = write(privateDir, "y.xml", "secret");
        Path link = new File(filesDir, "link.xml").toPath();
        Files.createSymbolicLink(link, new File(prefs).toPath());
        assertThrows(IOException.class, () -> read(Bridge.CAPACITOR_FILE_START + link));
    }

    @Test
    public void rejectsSiblingDirectorySharingARootPrefix() throws IOException {
        File sibling = new File(filesDir.getParentFile(), "files_evil");
        sibling.mkdirs();
        String path = write(sibling, "z.txt", "z");
        assertThrows(IOException.class, () -> read(Bridge.CAPACITOR_FILE_START + path));
    }
}
