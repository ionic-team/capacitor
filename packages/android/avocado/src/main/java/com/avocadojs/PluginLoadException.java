package com.avocadojs;

/**
 * Thrown when a plugin fails to instantiate
 */
public class PluginLoadException extends Exception {
  PluginLoadException(String s) {
    super(s);
  }
}
