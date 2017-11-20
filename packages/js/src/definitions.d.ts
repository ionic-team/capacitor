export type PluginCallback = (error: PluginResultError, data: PluginResultData) => void;
// TODO: Get more complex custom promise type
export type PluginCallbackHandler = PluginCallback | any;

/**
 * Data that won't be sent to the native layer
 * from the caller. For example, a callback function
 * that cannot be cloned in JS
 */
export interface PluginCaller {
  callbackFunction?: PluginCallback;
}

/**
 * Metadata about a native plugin call.
 */
export interface PluginCall {
  pluginId: string;
  methodName: string;
  data: any;

  callbackId?: string;

  callbackFunction?: Function;

  // The type of callback we want
  callbackType?: string;//"callback" | "promise" | "observable";
}

export interface StoredPluginCall {
  call: PluginCall;
  callbackHandler: PluginCallbackHandler;
}

export interface PluginResultData {
  [key: string]: any;
}

export interface PluginResultError {
  message: string;
}
/**
 * A resulting call back from the native layer.
 */
export interface PluginResult {
  pluginId: string;
  methodName: string;
  data: PluginResultData;
  callbackId?: string;
  success: boolean;
  error?: PluginResultError;
}

export interface NativePostMessage {
  (call: PluginCall, caller: PluginCaller): void;
}