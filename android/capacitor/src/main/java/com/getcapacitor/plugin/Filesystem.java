package com.getcapacitor.plugin;

import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.json.JSONException;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

@NativePlugin()
public class Filesystem extends Plugin {

  private File getFileObject(String path, String directory) {
    if (directory == null) {
      Uri u = Uri.parse(path);
      return new File(u.getPath());
    }

    File androidDirectory = this.getDirectory(directory);

    if (androidDirectory == null) {
      return null;
    }

    return new File(androidDirectory, path);
  }

  private String readFileAsString(File file, Charset charset) throws IOException {
    final StringBuilder text = new StringBuilder();

    BufferedReader br = new BufferedReader(
        new InputStreamReader(
            new FileInputStream(file),
            charset
        )
    );
    String line;

    while ((line = br.readLine()) != null) {
      text.append(line);
      text.append('\n');
    }
    br.close();
    return text.toString();
  }

  private String readFileAsBase64EncodedData(File file) throws IOException {
    FileInputStream fileInputStreamReader = new FileInputStream(file);
    byte[] bytes = new byte[(int)file.length()];
    fileInputStreamReader.read(bytes);
    return new String(Base64.encodeToString(bytes, Base64.DEFAULT));
  }

  @PluginMethod()
  public void readFile(PluginCall call) {
    String file = call.getString("path");
    String data = call.getString("data");
    String directory = call.getString("directory");
    String encoding = call.getString("encoding");

    File fileObject = getFileObject(file, directory);

    Charset charset = this.getEncoding(encoding);
    if(encoding != null && charset == null) {
      call.error("Unsupported encoding provided: " + encoding);
      return;
    }

    if(fileObject == null) {
      call.error("Invalid file path");
      return;
    }

    try {
      String dataStr;
      if (charset != null) {
        dataStr = readFileAsString(fileObject, charset);
      } else {
        dataStr = readFileAsBase64EncodedData(fileObject);
      }

      JSObject ret = new JSObject();
      ret.putOpt("data", dataStr);
      call.success(ret);
    } catch (IOException ex) {
      call.error("Unable to read file", ex);
    } catch(JSONException ex) {
      call.error("Unable to return value for reading file", ex);
    }
  }

  @PluginMethod()
  public void writeFile(PluginCall call) {
    String file = call.getString("path");
    String data = call.getString("data");
    String directory = call.getString("directory");
    String encoding = call.getString("encoding", "utf8");
    boolean append = call.getBoolean("append", false).booleanValue();

    File androidDirectory = this.getDirectory(directory);
    Charset charset = this.getEncoding(encoding);
    if(charset == null) {
      call.error("Unsupported encoding provided: " + encoding);
      return;
    }
    if(androidDirectory == null) {
      call.error("Unable to find system directory \"" + directory + "\"");
      return;
    }

    File fileObject = new File(androidDirectory, file);

    final StringBuilder text = new StringBuilder();

    try {
      BufferedWriter bw = new BufferedWriter(
          new OutputStreamWriter(
              new FileOutputStream(fileObject, append),
              charset
          )
      );

      bw.write(data);

      bw.close();

      call.success();
    } catch (IOException ex) {
      call.error("Unable to write file", ex);
    }
  }

  @PluginMethod()
  public void appendFile(PluginCall call) {
    try {
      call.getData().putOpt("append", true);
    } catch(JSONException ex) {}

    this.writeFile(call);
  }

  @PluginMethod()
  public void deleteFile(PluginCall call) {
    String file = call.getString("path");
    String directory = call.getString("directory");

    File androidDirectory = this.getDirectory(directory);
    if(androidDirectory == null) {
      call.error("Unable to find system directory \"" + directory + "\"");
      return;
    }

    File fileObject = new File(androidDirectory, file);

    boolean deleted = fileObject.delete();
    if(deleted == false) {
      call.error("Unable to delete file");
    } else {
      call.success();
    }
  }

  @PluginMethod()
  public void mkdir(PluginCall call) {
    String path = call.getString("path");
    String directory = call.getString("directory");
    boolean intermediate = call.getBoolean("createIntermediateDirectories", false).booleanValue();

    File androidDirectory = this.getDirectory(directory);
    if(androidDirectory == null) {
      call.error("Unable to find system directory \"" + directory + "\"");
      return;
    }

    File fileObject = new File(androidDirectory, path);

    Log.d(Bridge.TAG, "Creating directory " + fileObject.getAbsolutePath());

    boolean created = false;
    if (intermediate) {
      created = fileObject.mkdirs();
    } else {
      created = fileObject.mkdir();
    }
    if(created == false) {
      call.error("Unable to create directory, unknown reason");
    } else {
      call.success();
    }
  }

  @PluginMethod()
  public void rmdir(PluginCall call) {
    String path = call.getString("path");
    String directory = call.getString("directory");

    File androidDirectory = this.getDirectory(directory);
    if(androidDirectory == null) {
      call.error("Unable to find system directory \"" + directory + "\"");
      return;
    }

    File fileObject = new File(androidDirectory, path);

    boolean deleted = fileObject.delete();

    if(deleted == false) {
      call.error("Unable to delete directory, unknown reason");
    } else {
      call.success();
    }
  }

  @PluginMethod()
  public void readdir(PluginCall call) {
    String path = call.getString("path");
    String directory = call.getString("directory");

    File androidDirectory = this.getDirectory(directory);
    if(androidDirectory == null) {
      call.error("Unable to find system directory \"" + directory + "\"");
      return;
    }

    File fileObject = new File(androidDirectory, path);

    String[] files = fileObject.list();

    JSObject ret = new JSObject();
    ret.put("files", JSArray.from(files));
    call.success(ret);
  }

  @PluginMethod()
  public void getUri(PluginCall call) {
    String path = call.getString("path");
    String directory = call.getString("directory");

    File androidDirectory = this.getDirectory(directory);
    if(androidDirectory == null) {
      call.error("Unable to find system directory \"" + directory + "\"");
      return;
    }

    File fileObject = new File(androidDirectory, path);

    if (!fileObject.exists()) {
      call.error("File does not exist");
      return;
    }

    JSObject data = new JSObject();
    data.put("uri", Uri.fromFile(fileObject).toString());
    call.success(data);
  }

  @PluginMethod()
  public void stat(PluginCall call) {
    String path = call.getString("path");
    String directory = call.getString("directory");

    File androidDirectory = this.getDirectory(directory);
    if(androidDirectory == null) {
      call.error("Unable to find system directory \"" + directory + "\"");
      return;
    }

    File fileObject = new File(androidDirectory, path);

    if (!fileObject.exists()) {
      call.error("File does not exist");
      return;
    }

    JSObject data = new JSObject();
    data.put("type", fileObject.isDirectory() ? "directory" : "file");
    data.put("size", fileObject.length());
    data.put("ctime", null);
    data.put("mtime", fileObject.lastModified());
    data.put("uri", Uri.fromFile(fileObject).toString());
    call.success(data);
  }

  private Charset getEncoding(String encoding) {
    if (encoding == null) {
      return null;
    }

    switch(encoding) {
      case "utf8":
        return StandardCharsets.UTF_8;
      case "utf16":
        return StandardCharsets.UTF_16;
      case "ascii":
        return StandardCharsets.US_ASCII;
    }
    return null;
  }

  private File getDirectory(String directory) {
    Context c = bridge.getContext();
    switch(directory) {
      case "APPLICATION":
        return c.getFilesDir();
      case "DOCUMENTS":
        return c.getFilesDir();
      case "DATA":
        return c.getFilesDir();
      case "CACHE":
        return c.getCacheDir();
      case "EXTERNAL":
        return c.getExternalFilesDir(null);
      case "EXTERNAL_STORAGE":
        return Environment.getExternalStorageDirectory();
    }
    return null;
  }

}
