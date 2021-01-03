/*
 * Copyright (C) 2006 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//package com.google.webviewlocalserver.third_party.android;
package com.getcapacitor;

import android.net.Uri;
import com.getcapacitor.util.HostMask;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class UriMatcher {

    /**
     * Creates the root node of the URI tree.
     *
     * @param code the code to match for the root URI
     */
    public UriMatcher(Object code) {
        mCode = code;
        mWhich = -1;
        mChildren = new ArrayList<>();
        mText = null;
    }

    private UriMatcher() {
        mCode = null;
        mWhich = -1;
        mChildren = new ArrayList<>();
        mText = null;
    }

    /**
     * Add a URI to match, and the code to return when this URI is
     * matched. URI nodes may be exact match string, the token "*"
     * that matches any text, or the token "#" that matches only
     * numbers.
     * <p>
     * Starting from API level {@link android.os.Build.VERSION_CODES#JELLY_BEAN_MR2},
     * this method will accept a leading slash in the path.
     *
     * @param authority the authority to match
     * @param path      the path to match. * may be used as a wild card for
     *                  any text, and # may be used as a wild card for numbers.
     * @param code      the code that is returned when a URI is matched
     *                  against the given components. Must be positive.
     */
    public void addURI(String scheme, String authority, String path, Object code) {
        if (code == null) {
            throw new IllegalArgumentException("Code can't be null");
        }

        String[] tokens = null;
        if (path != null) {
            String newPath = path;
            // Strip leading slash if present.
            if (!path.isEmpty() && path.charAt(0) == '/') {
                newPath = path.substring(1);
            }
            tokens = PATH_SPLIT_PATTERN.split(newPath);
        }

        int numTokens = tokens != null ? tokens.length : 0;
        UriMatcher node = this;
        for (int i = -2; i < numTokens; i++) {
            String token;
            if (i == -2) token = scheme; else if (i == -1) token = authority; else token = tokens[i];
            ArrayList<UriMatcher> children = node.mChildren;
            int numChildren = children.size();
            UriMatcher child;
            int j;
            for (j = 0; j < numChildren; j++) {
                child = children.get(j);
                if (token.equals(child.mText)) {
                    node = child;
                    break;
                }
            }
            if (j == numChildren) {
                // Child not found, create it
                child = new UriMatcher();
                if (i == -1 && token.contains("*")) {
                    child.mWhich = MASK;
                } else if (token.equals("**")) {
                    child.mWhich = REST;
                } else if (token.equals("*")) {
                    child.mWhich = TEXT;
                } else {
                    child.mWhich = EXACT;
                }
                child.mText = token;
                node.mChildren.add(child);
                node = child;
            }
        }
        node.mCode = code;
    }

    static final Pattern PATH_SPLIT_PATTERN = Pattern.compile("/");

    /**
     * Try to match against the path in a url.
     *
     * @param uri The url whose path we will match against.
     * @return The code for the matched node (added using addURI),
     * or null if there is no matched node.
     */
    public Object match(Uri uri) {
        final List<String> pathSegments = uri.getPathSegments();
        final int li = pathSegments.size();

        UriMatcher node = this;

        if (li == 0 && uri.getAuthority() == null) {
            return this.mCode;
        }

        for (int i = -2; i < li; i++) {
            String u;
            if (i == -2) u = uri.getScheme(); else if (i == -1) u = uri.getAuthority(); else u = pathSegments.get(i);
            ArrayList<UriMatcher> list = node.mChildren;
            if (list == null) {
                break;
            }
            node = null;
            int lj = list.size();
            for (int j = 0; j < lj; j++) {
                UriMatcher n = list.get(j);
                which_switch:switch (n.mWhich) {
                    case MASK:
                        if (HostMask.Parser.parse(n.mText).matches(u)) {
                            node = n;
                        }
                        break;
                    case EXACT:
                        if (n.mText.equals(u)) {
                            node = n;
                        }
                        break;
                    case TEXT:
                        node = n;
                        break;
                    case REST:
                        return n.mCode;
                }
                if (node != null) {
                    break;
                }
            }
            if (node == null) {
                return null;
            }
        }

        return node.mCode;
    }

    private static final int EXACT = 0;
    private static final int TEXT = 1;
    private static final int REST = 2;
    private static final int MASK = 3;

    private Object mCode;
    private int mWhich;
    private String mText;
    private ArrayList<UriMatcher> mChildren;
}
