package com.getcapacitor.plugin.util;

enum MimeType {
    APPLICATION_JSON("application/json"),
    APPLICATION_VND_API_JSON("application/vnd.api+json"), // https://jsonapi.org
    TEXT_HTML("text/html");

    private final String value;

    MimeType(String value) {
        this.value = value;
    }

    String getValue() {
        return value;
    }
}
