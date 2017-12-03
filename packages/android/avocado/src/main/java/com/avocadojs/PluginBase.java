package com.avocadojs;

/**
 * Base class for all plugins
 */
public class PluginBase {
  protected Bridge bridge;

  public PluginBase() {
  }

  public void setBridge(Bridge bridge) {
    this.bridge = bridge;
  }
}
