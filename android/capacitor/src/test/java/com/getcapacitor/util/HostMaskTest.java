package com.getcapacitor.util;

import static org.junit.Assert.*;

import org.junit.Test;

import com.getcapacitor.util.HostMask.Util;

public class HostMaskTest {

    @Test
    public void testParser() {
        assertEquals(HostMask.Any.class, HostMask.Parser.parse("*,example.org,*.example.org".split(",")).getClass());
        assertEquals(HostMask.Simple.class, HostMask.Parser.parse("*").getClass());
        assertEquals(HostMask.Nothing.class, HostMask.Parser.parse((String) null).getClass());
    }

    @Test
    public void testAny() {
        HostMask mask = HostMask.Any.parse("*.example.org", "example.org");
        assertFalse(mask.matches("org"));
        assertTrue(mask.matches("example.org"));
        assertTrue(mask.matches("www.example.org"));
        assertFalse(mask.matches("imap.mail.example.org"));
        assertFalse(mask.matches("another.org"));
        assertFalse(mask.matches("www.another.org"));
        assertFalse(mask.matches(null));
    }

    @Test
    public void testAnyWildcard() {
        HostMask mask = HostMask.Any.parse("*");
        assertTrue(mask.matches("org"));
        assertTrue(mask.matches("example.org"));
        assertTrue(mask.matches("www.example.org"));
        assertTrue(mask.matches("imap.mail.example.org"));
        assertTrue(mask.matches("another.org"));
        assertTrue(mask.matches("www.another.org"));
        assertFalse(mask.matches(null));
    }

    @Test
    public void testSimple() {
        HostMask mask = HostMask.Simple.parse("*.org");
        assertTrue(mask.matches("example.org"));
        assertFalse(mask.matches("org"));
        assertFalse(mask.matches("www.example.org"));
        assertFalse("Null host never matches", mask.matches(null));
    }

    @Test
    public void testSimpleExample1() {
        HostMask mask = HostMask.Simple.parse("*.example.org");
        assertFalse("Null host never matches", mask.matches("example.org"));
    }

    @Test
    public void testSimpleExample2() {
        HostMask mask = HostMask.Simple.parse("*");
        assertTrue("Single star matches everything", mask.matches("example.org"));
    }

    @Test
    public void test192168ForLocalTestingSakes() {
        HostMask mask = HostMask.Simple.parse("192.168.*.*");
        assertTrue("Matches 192.168.*.*", mask.matches("192.168.2.5"));
        assertFalse("Matches NOT 192.168.*.*", mask.matches("192.66.2.5"));
    }

    @Test
    public void testUtil() {
        assertTrue("Everything matches *", Util.matches("*", "*"));
        assertTrue("Everything matches *", Util.matches("*", "org"));
        assertTrue(Util.matches("org", "org"));
        assertTrue("Match is case insensitive", Util.matches("ORG", "org"));
        assertFalse("Nothing matches null mask", Util.matches(null, "org"));
        assertFalse("Nothing matches null mask", Util.matches(null, null));
    }


}
