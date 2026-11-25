package com.getcapacitor;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class InternalProxyPathTest {

    @Test
    public void matchesFileProxyPath() {
        assertTrue(Bridge.isInternalProxyPath("/_capacitor_file_/storage/emulated/0/poc.svg"));
    }

    @Test
    public void matchesContentProxyPath() {
        assertTrue(Bridge.isInternalProxyPath("/_capacitor_content_/media/external/images/1"));
    }

    @Test
    public void matchesHttpInterceptorPath() {
        assertTrue(Bridge.isInternalProxyPath("/_capacitor_http_interceptor_/"));
    }

    @Test
    public void doesNotMatchOtherPaths() {
        assertFalse(Bridge.isInternalProxyPath("/index.html"));
        assertFalse(Bridge.isInternalProxyPath("/assets/_capacitor_file_/x"));
        assertFalse(Bridge.isInternalProxyPath(""));
    }

    @Test
    public void doesNotMatchNullPath() {
        assertFalse(Bridge.isInternalProxyPath(null));
    }
}
