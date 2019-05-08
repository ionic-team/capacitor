package com.getcapacitor.plugin;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Environment;
import android.util.Base64;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginRequestCodes;
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

@NativePlugin(requestCodes = {
  PluginRequestCodes.FILESYSTEM_REQUEST_WRITE_FILE_PERMISSIONS,
  PluginRequestCodes.FILESYSTEM_REQUEST_WRITE_FOLDER_PERMISSIONS,
  PluginRequestCodes.FILESYSTEM_REQUEST_READ_FILE_PERMISSIONS,
  PluginRequestCodes.FILESYSTEM_REQUEST_READ_FOLDER_PERMISSIONS,
  PluginRequestCodes.FILESYSTEM_REQUEST_DELETE_FILE_PERMISSIONS,
  PluginRequestCodes.FILESYSTEM_REQUEST_DELETE_FOLDER_PERMISSIONS,
  PluginRequestCodes.FILESYSTEM_REQUEST_URI_PERMISSIONS,
  PluginRequestCodes.FILESYSTEM_REQUEST_STAT_PERMISSIONS
})
public class Filesystem extends Plugin {

  private static final String PERMISSION_DENIED_ERROR = "Unable to do file operation, user denied permission request";

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
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
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
      if (u.getScheme() == null || u.getScheme().equals("file")) {
        return new File(u.getPath());
      }
    }

    File androidDirectory = this.getDirectory(directory);

    if (androidDirectory == null) {
      return null;
    } else {
      if(!androidDirectory.exists()) {
        androidDirectory.mkdir();
      }
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
    saveCall(call);
    String file = call.getString("path");
    String data = call.getString("data");
    String directory = getDirectoryParameter(call);
    String encoding = call.getString("encoding");

    Charset charset = this.getEncoding(encoding);
    if(encoding != null && charset == null) {
      call.error("Unsupported encoding provided: " + encoding);
      return;
    }

    if (!isPublicDirectory(directory)
        || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_READ_FILE_PERMISSIONS, Manifest.permission.READ_EXTERNAL_STORAGE)) {
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
  }

  @PluginMethod()
  public void writeFile(PluginCall call) {
    saveCall(call);
    String path = call.getString("path");
    String data = call.getString("data");

    if (path == null) {
      Log.e(getLogTag(), "No path or filename retrieved from call");
      call.error("NO_PATH");
      return;
    }

    if (data == null) {
      Log.e(getLogTag(), "No data retrieved from call");
      call.error("NO_DATA");
      return;
    }

    String directory = getDirectoryParameter(call);
    if (directory != null) {
      if (!isPublicDirectory(directory)
        || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_WRITE_FILE_PERMISSIONS, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
        // create directory because it might not exist
        File androidDir = getDirectory(directory);
        if (androidDir != null) {
          if (androidDir.exists() || androidDir.mkdirs()) {
            // path might include directories as well
            File fileObject = new File(androidDir, path);
            if (fileObject.getParentFile().exists() || fileObject.getParentFile().mkdirs()) {
              saveFile(call, fileObject, data);
            }
          } else {
            Log.e(getLogTag(), "Not able to create '" + directory + "'!");
            call.error("NOT_CREATED_DIR");
          }
        } else {
          Log.e(getLogTag(), "Directory ID '" + directory + "' is not supported by plugin");
          call.error("INVALID_DIR");
        }
      }
    } else {
      // check if file://
      Uri u = Uri.parse(path);
      if ("file".equals(u.getScheme())) {
        File fileObject = new File(u.getPath());
        // do not know where the file is being store so checking the permission to be secure
        // TODO to prevent permission checking we need a property from the call
        if (isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_WRITE_FILE_PERMISSIONS, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
          if (fileObject.getParentFile().exists() || fileObject.getParentFile().mkdirs()) {
            saveFile(call, fileObject, data);
          }
        }
      }
    }
  }

  private void saveFile(PluginCall call, File file, String data) {
    String encoding = call.getString("encoding");
    boolean append = call.getBoolean("append", false);

    Charset charset = this.getEncoding(encoding);
    if (encoding != null && charset == null) {
      call.error("Unsupported encoding provided: " + encoding);
      return;
    }

    // if charset is not null assume its a plain text file the user wants to save
    boolean success = false;
    if (charset != null) {
      try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
        new FileOutputStream(file, append), charset))) {
        writer.write(data);
        success = true;
      } catch (IOException e) {
        Log.e(getLogTag(), "Creating text file '" + file.getPath() + "' with charset '" + charset + "' failed. Error: " + e.getMessage(), e);
      }
    } else {
      //remove header from dataURL
      if(data.indexOf(",") != -1) {
        data = data.split(",")[1];
      }
      try (FileOutputStream fos = new FileOutputStream(file, append)) {
        fos.write(Base64.decode(data, Base64.NO_WRAP));
        success = true;
      } catch (IOException e) {
        Log.e(getLogTag(), "Creating binary file '" + file.getPath() + "' failed. Error: " + e.getMessage(), e);
      }
    }

    if (success) {
      // update mediaStore index only if file was written to external storage
      if (isPublicDirectory(getDirectoryParameter(call))) {
        MediaScannerConnection.scanFile(getContext(), new String[] {file.getAbsolutePath()}, null, null);
      }
      Log.d(getLogTag(), "File '" + file.getAbsolutePath() + "' saved!");
      call.success();
    } else {
      call.error("FILE_NOTCREATED");
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
    saveCall(call);
    String file = call.getString("path");
    String directory = getDirectoryParameter(call);

    File fileObject = getFileObject(file, directory);

    if (!isPublicDirectory(directory)
        || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_DELETE_FILE_PERMISSIONS, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
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
  }

  @PluginMethod()
  public void mkdir(PluginCall call) {
    saveCall(call);
    String path = call.getString("path");
    String directory = getDirectoryParameter(call);
    boolean intermediate = call.getBoolean("createIntermediateDirectories", false).booleanValue();

    File fileObject = getFileObject(path, directory);

    if (fileObject.exists()) {
      call.error("Directory exists");
      return;
    }

    if (!isPublicDirectory(directory)
            || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_WRITE_FOLDER_PERMISSIONS, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
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
  }

  @PluginMethod()
  public void rmdir(PluginCall call) {
    saveCall(call);
    String path = call.getString("path");
    String directory = getDirectoryParameter(call);

    File fileObject = getFileObject(path, directory);

    if (!isPublicDirectory(directory)
        || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_DELETE_FOLDER_PERMISSIONS, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
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
  }

  @PluginMethod()
  public void readdir(PluginCall call) {
    saveCall(call);
    String path = call.getString("path");
    String directory = getDirectoryParameter(call);

    File fileObject = getFileObject(path, directory);

     if (!isPublicDirectory(directory)
         || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_READ_FOLDER_PERMISSIONS, Manifest.permission.READ_EXTERNAL_STORAGE)) {
      if (fileObject != null && fileObject.exists()) {
        String[] files = fileObject.list();

        JSObject ret = new JSObject();
        ret.put("files", JSArray.from(files));
        call.success(ret);
      } else {
      call.error("Directory does not exist");
      }
    }
  }

  @PluginMethod()
  public void getUri(PluginCall call) {
    saveCall(call);
    String path = call.getString("path");
    String directory = getDirectoryParameter(call);

    File fileObject = getFileObject(path, directory);

    if (!isPublicDirectory(directory)
        || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_URI_PERMISSIONS, Manifest.permission.READ_EXTERNAL_STORAGE)) {
      JSObject data = new JSObject();
      data.put("uri", Uri.fromFile(fileObject).toString());
      call.success(data);
    }
  }

  @PluginMethod()
  public void stat(PluginCall call) {
    saveCall(call);
    String path = call.getString("path");
    String directory = getDirectoryParameter(call);

    File fileObject = getFileObject(path, directory);

    if (!isPublicDirectory(directory)
        || isStoragePermissionGranted(PluginRequestCodes.FILESYSTEM_REQUEST_STAT_PERMISSIONS, Manifest.permission.READ_EXTERNAL_STORAGE)) {
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

  /**
   * Checks the the given permission and requests them if they are not already granted.
   * @param permissionRequestCode the request code see {@link PluginRequestCodes}
   * @param permission the permission string
   * @return Returns true if the permission is granted and false if it is denied.
   */
  private boolean isStoragePermissionGranted(int permissionRequestCode, String permission) {
    if (hasPermission(permission)) {
      Log.v(getLogTag(),"Permission '" + permission + "' is granted");
      return true;
    } else {
      Log.v(getLogTag(),"Permission '" + permission + "' denied. Asking user for it.");
      pluginRequestPermissions(new String[] {permission}, permissionRequestCode);
      return false;
    }
  }

  /**
   * Reads the directory parameter from the plugin call
   * @param call the plugin call
   */
  private String getDirectoryParameter(PluginCall call) {
    return call.getString("directory");
  }

  /**
   * True if the given directory string is a public storage directory, which is accessible by the user or other apps.
   * @param directory the directory string.
   */
  private boolean isPublicDirectory(String directory) {
    return "DOCUMENTS".equals(directory) || "EXTERNAL_STORAGE".equals(directory);
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    Log.d(getLogTag(),"handling request perms result");

    if (getSavedCall() == null) {
      Log.d(getLogTag(),"No stored plugin call for permissions request result");
      return;
    }

    PluginCall savedCall = getSavedCall();

    for (int i = 0; i < grantResults.length; i++) {
      int result = grantResults[i];
      String perm = permissions[i];
      if(result == PackageManager.PERMISSION_DENIED) {
        Log.d(getLogTag(), "User denied storage permission: " + perm);
        savedCall.error(PERMISSION_DENIED_ERROR);
        return;
      }
    }

    if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_WRITE_FILE_PERMISSIONS) {
      this.writeFile(savedCall);
    } else if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_WRITE_FOLDER_PERMISSIONS) {
      this.mkdir(savedCall);
    } else if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_READ_FILE_PERMISSIONS) {
      this.readFile(savedCall);
    } else if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_READ_FOLDER_PERMISSIONS) {
      this.readdir(savedCall);
    } else if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_DELETE_FILE_PERMISSIONS) {
      this.deleteFile(savedCall);
    } else if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_DELETE_FOLDER_PERMISSIONS) {
      this.rmdir(savedCall);
    } else if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_URI_PERMISSIONS) {
      this.getUri(savedCall);
    } else if (requestCode == PluginRequestCodes.FILESYSTEM_REQUEST_STAT_PERMISSIONS) {
      this.stat(savedCall);
    }
  }

}
