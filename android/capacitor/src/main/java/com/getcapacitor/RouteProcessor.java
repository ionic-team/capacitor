package com.getcapacitor;

/**
 * An interface used in the processing of routes
 */
public interface RouteProcessor {
    ProcessedRoute process(String basePath, String path);
}
