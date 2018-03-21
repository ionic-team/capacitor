package com.getcapacitor.plugin.camera;

public enum CameraResultType {
    BASE64("base64"),
    URI("uri");

    private String type;

    CameraResultType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
