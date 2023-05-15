package com.getcapacitor;

public class ServerPath {

    public enum PathType {
        BASE_PATH,
        ASSET_PATH
    }

    private final PathType type;
    private final String path;

    public ServerPath(PathType type, String path) {
        this.type = type;
        this.path = path;
    }

    public PathType getType() {
        return type;
    }

    public String getPath() {
        return path;
    }
}
