package com.getcapacitor;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;

import android.content.Context;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

public class AndroidProtocolHandlerBasePathTest {

    @Rule
    public TemporaryFolder temp = new TemporaryFolder();

    private AndroidProtocolHandler handler;
    private File base;
    private File outside;

    @Before
    public void setUp() throws IOException {
        File files = temp.newFolder("files");
        base = new File(files, "www");
        base.mkdirs();
        new File(base, "sub").mkdirs();
        outside = new File(files, "secret.txt");
        write(outside, "secret");
        // shares the base path as a name prefix, but is a sibling
        File sibling = new File(files, "www2");
        sibling.mkdirs();
        write(new File(sibling, "x.txt"), "sibling");
        handler = new AndroidProtocolHandler(mock(Context.class));
    }

    private static void write(File file, String content) throws IOException {
        Files.write(file.toPath(), content.getBytes(StandardCharsets.UTF_8));
    }

    private String read(String requestPath) throws IOException {
        try (InputStream in = handler.openBasePathFile(base.getAbsolutePath(), base.getAbsolutePath() + requestPath)) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    public void servesFileInsideBasePath() throws IOException {
        write(new File(base, "index.html"), "app");
        assertEquals("app", read("/index.html"));
    }

    @Test
    public void servesFileInSubdirectory() throws IOException {
        write(new File(base, "sub/a.js"), "js");
        assertEquals("js", read("/sub/a.js"));
    }

    @Test
    public void servesDotDotThatStaysInsideBasePath() throws IOException {
        write(new File(base, "index.html"), "app");
        assertEquals("app", read("/sub/../index.html"));
    }

    @Test
    public void refusesTraversalOutOfBasePath() {
        assertThrows(FileNotFoundException.class, () -> read("/../secret.txt"));
        assertThrows(FileNotFoundException.class, () -> read("/sub/../../secret.txt"));
    }

    @Test
    public void refusesSiblingDirectorySharingNamePrefix() {
        assertThrows(FileNotFoundException.class, () -> read("/../www2/x.txt"));
    }

    @Test
    public void refusesSymlinkPointingOutOfBasePath() throws IOException {
        Files.createSymbolicLink(new File(base, "link.txt").toPath(), outside.toPath());
        assertThrows(FileNotFoundException.class, () -> read("/link.txt"));
    }

    private String readRouted(String requestPath, File processed) throws IOException {
        try (InputStream in = handler.openRoutedFile(requestPath, processed.getAbsolutePath())) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    public void routedFileServesProcessorChosenLocation() throws IOException {
        // a route processor may map requests to a location outside the base path on purpose
        assertEquals("secret", readRouted("/data.txt", outside));
    }

    @Test
    public void routedFileRefusesParentDirectorySegmentInRequest() {
        File mapped = new File(base, "../secret.txt");
        assertThrows(FileNotFoundException.class, () -> readRouted("/../secret.txt", mapped));
        assertThrows(FileNotFoundException.class, () -> readRouted("/a/b/../../../secret.txt", mapped));
    }

    @Test
    public void routedFileAllowsDotsInFileNames() throws IOException {
        File file = new File(base, "a..b.js");
        write(file, "js");
        assertEquals("js", readRouted("/a..b.js", file));
    }
}
