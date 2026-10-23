package com.getcapacitor;

import static org.junit.Assert.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Test;

public class BoundedInputStreamTest {

    private byte[] testData() {
        byte[] data = new byte[256];
        for (int i = 0; i < data.length; i++) {
            data[i] = (byte) i;
        }
        return data;
    }

    @Test
    public void readSingleByte_stopsAtLimit() throws IOException {
        byte[] data = testData();
        InputStream bounded = new WebViewLocalServer.BoundedInputStream(new ByteArrayInputStream(data), 5);

        for (int i = 0; i < 5; i++) {
            assertEquals(i, bounded.read());
        }
        assertEquals(-1, bounded.read());
    }

    @Test
    public void readByteArray_stopsAtLimit() throws IOException {
        byte[] data = testData();
        InputStream bounded = new WebViewLocalServer.BoundedInputStream(new ByteArrayInputStream(data), 10);

        byte[] buf = new byte[20];
        int read = bounded.read(buf, 0, 20);
        assertEquals(10, read);
        assertEquals(-1, bounded.read(buf, 0, 20));

        for (int i = 0; i < 10; i++) {
            assertEquals((byte) i, buf[i]);
        }
    }

    @Test
    public void available_reflectsLimit() throws IOException {
        byte[] data = testData();
        InputStream bounded = new WebViewLocalServer.BoundedInputStream(new ByteArrayInputStream(data), 10);

        assertEquals(10, bounded.available());

        bounded.read();
        assertEquals(9, bounded.available());
    }

    @Test
    public void limitLargerThanStream_returnsAllData() throws IOException {
        byte[] data = new byte[] { 1, 2, 3 };
        InputStream bounded = new WebViewLocalServer.BoundedInputStream(new ByteArrayInputStream(data), 100);

        assertEquals(1, bounded.read());
        assertEquals(2, bounded.read());
        assertEquals(3, bounded.read());
        assertEquals(-1, bounded.read());
    }

    @Test
    public void zeroLimit_returnsNoData() throws IOException {
        byte[] data = testData();
        InputStream bounded = new WebViewLocalServer.BoundedInputStream(new ByteArrayInputStream(data), 0);

        assertEquals(-1, bounded.read());
        assertEquals(0, bounded.available());
    }

    @Test
    public void close_closesUnderlying() throws IOException {
        final boolean[] closed = { false };
        InputStream inner = new ByteArrayInputStream(new byte[10]) {
            @Override
            public void close() throws IOException {
                closed[0] = true;
                super.close();
            }
        };
        InputStream bounded = new WebViewLocalServer.BoundedInputStream(inner, 5);
        bounded.close();
        assertTrue(closed[0]);
    }

    /**
     * Simulates the WebView range request behavior:
     * WebView seeks (consumes) fromRange bytes, then reads contentLength bytes.
     * The BoundedInputStream limit should be endRange + 1 to account for both.
     */
    @Test
    public void simulateWebViewRangeSeek() throws IOException {
        // 1000-byte file, request bytes=200-499
        int totalSize = 1000;
        int fromRange = 200;
        int endRange = 499;
        int contentLength = endRange - fromRange + 1; // 300

        byte[] fileData = new byte[totalSize];
        for (int i = 0; i < totalSize; i++) {
            fileData[i] = (byte) (i & 0xFF);
        }

        InputStream bounded = new WebViewLocalServer.BoundedInputStream(
            new ByteArrayInputStream(fileData),
            endRange + 1 // 500
        );

        // WebView seeks by consuming fromRange bytes
        byte[] seekBuf = new byte[fromRange];
        int seeked = 0;
        while (seeked < fromRange) {
            int r = bounded.read(seekBuf, seeked, fromRange - seeked);
            if (r == -1) break;
            seeked += r;
        }
        assertEquals(fromRange, seeked);

        // WebView then reads the actual content
        byte[] content = new byte[contentLength];
        int totalRead = 0;
        while (totalRead < contentLength) {
            int r = bounded.read(content, totalRead, contentLength - totalRead);
            if (r == -1) break;
            totalRead += r;
        }
        assertEquals(contentLength, totalRead);

        // Verify data is correct (bytes 200-499)
        for (int i = 0; i < contentLength; i++) {
            assertEquals((byte) ((fromRange + i) & 0xFF), content[i]);
        }

        // No more data should be available
        assertEquals(-1, bounded.read());
    }

    /**
     * When end range is omitted (request to end of file),
     * the limit is totalSize and the full remainder is returned.
     */
    @Test
    public void simulateWebViewRangeSeek_openEnded() throws IOException {
        int totalSize = 500;
        int fromRange = 300;
        int endRange = totalSize - 1; // 499

        byte[] fileData = new byte[totalSize];
        for (int i = 0; i < totalSize; i++) {
            fileData[i] = (byte) (i & 0xFF);
        }

        InputStream bounded = new WebViewLocalServer.BoundedInputStream(
            new ByteArrayInputStream(fileData),
            endRange + 1 // = totalSize
        );

        // WebView seeks
        for (int i = 0; i < fromRange; i++) {
            int b = bounded.read();
            assertNotEquals(-1, b);
        }

        // Read remainder
        int contentLength = endRange - fromRange + 1; // 200
        byte[] content = new byte[contentLength];
        int totalRead = 0;
        while (totalRead < contentLength) {
            int r = bounded.read(content, totalRead, contentLength - totalRead);
            if (r == -1) break;
            totalRead += r;
        }
        assertEquals(contentLength, totalRead);

        // Verify last byte is correct
        assertEquals((byte) (endRange & 0xFF), content[contentLength - 1]);
        assertEquals(-1, bounded.read());
    }
}
