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
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

@NativePlugin()
public class Filesystem extends Plugin {
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

  private File getFileObject(String path, String directory) {
    if (directory == null) {
      Uri u = Uri.parse(path);
      if (u.getScheme().equals("file")) {
        return new File(u.getPath());
      }
    }

    File androidDirectory = this.getDirectory(directory);

    if (androidDirectory == null) {
      return null;
    }

    return new File(androidDirectory, path);
  }

  private InputStream getInputStream(String path, String directory) throws IOException {
    if (directory == null) {
      Uri u = Uri.parse(path);
      if (u.getScheme().equals("content")) {
        return getContext().getContentResolver().openInputStream(u);
      } else {
        return new FileInputStream(new File(u.getPath()));
      }
    }

    File androidDirectory = this.getDirectory(directory);

    if (androidDirectory == null) {
      return null;
    }

    return new FileInputStream(new File(androidDirectory, path));
  }

  private String readFileAsString(InputStream is, Charset charset) throws IOException {
    final StringBuilder text = new StringBuilder();

    BufferedReader br = new BufferedReader(
        new InputStreamReader(
            is,
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

  private String readFileAsBase64EncodedData(InputStream is) throws IOException {
    FileInputStream fileInputStreamReader = (FileInputStream) is;
    ByteArrayOutputStream byteStream = new ByteArrayOutputStream();

    byte[] buffer = new byte[1024];

    int c;
    while ((c = fileInputStreamReader.read(buffer)) != -1) {
      byteStream.write(buffer, 0, c);
    }
    fileInputStreamReader.close();

    return new String(Base64.encodeToString(byteStream.toByteArray(), Base64.DEFAULT));
  }

  @PluginMethod()
  public void readFile(PluginCall call) {
    String file = call.getString("path");
    String data = call.getString("data");
    String directory = call.getString("directory");
    String encoding = call.getString("encoding");

    Charset charset = this.getEncoding(encoding);
    if(encoding != null && charset == null) {
      call.error("Unsupported encoding provided: " + encoding);
      return;
    }

    try {
      InputStream is = getInputStream(file, directory);
      String dataStr;
      if (charset != null) {
        dataStr = readFileAsString(is, charset);
      } else {
        dataStr = readFileAsBase64EncodedData(is);
      }

      JSObject ret = new JSObject();
      ret.putOpt("data", dataStr);
      call.success(ret);
    } catch (FileNotFoundException ex) {
      call.error("File does not exist", ex);
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
    String encoding = call.getString("encoding");
    boolean append = call.getBoolean("append", false).booleanValue();

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
      if (charset != null) {
        BufferedWriter bw = new BufferedWriter(
            new OutputStreamWriter(
                new FileOutputStream(fileObject, append),
                charset
            )
        );

        bw.write(data);

        bw.close();
      } else {
        FileOutputStream fos = new FileOutputStream(fileObject);
        fos.write(Base64.decode(data, Base64.NO_WRAP));
        fos.close();
      }

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

    File fileObject = getFileObject(file, directory);

    if (!fileObject.exists()) {
      call.error("File does not exist");
      return;
    }

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

    File fileObject = getFileObject(path, directory);

    if (fileObject.exists()) {
      call.error("Directory exists");
      return;
    }

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

    File fileObject = getFileObject(path, directory);

    if (!fileObject.exists()) {
      call.error("Directory does not exist");
      return;
    }

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

    File fileObject = getFileObject(path, directory);

    if (fileObject != null && fileObject.exists()) {
      String[] files = fileObject.list();

      JSObject ret = new JSObject();
      ret.put("files", JSArray.from(files));
      call.success(ret);
    } else {
      call.error("Directory does not exist");
    }
  }

  @PluginMethod()
  public void getUri(PluginCall call) {
    String path = call.getString("path");
    String directory = call.getString("directory");

    File fileObject = getFileObject(path, directory);

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

    File fileObject = getFileObject(path, directory);

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

}
