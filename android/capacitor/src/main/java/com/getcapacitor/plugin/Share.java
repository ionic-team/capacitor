package com.getcapacitor.plugin;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.webkit.MimeTypeMap;

import androidx.core.content.FileProvider;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.io.File;

@NativePlugin()
public class Share extends Plugin {

  @PluginMethod()
  public void share(PluginCall call) {
    String title = call.getString("title", "");
    String text = call.getString("text");
    String url = call.getString("url");
    String dialogTitle = call.getString("dialogTitle", "Share");

    if (text == null && url == null) {
      call.error("Must provide a URL or Message");
      return;
    }

    if(url != null && !isFileUrl(url) && !isHttpUrl(url)) {
      call.error("Unsupported url");
      return;
    }

    Intent intent = new Intent(Intent.ACTION_SEND);

    if (text != null) {
      // If they supplied both fields, concat em
      if (url != null && isHttpUrl(url)) text = text + " " + url;
      intent.putExtra(Intent.EXTRA_TEXT, text);
      intent.setTypeAndNormalize("text/plain");
    }

    if(url != null && isHttpUrl(url) && text == null) {
      intent.putExtra(Intent.EXTRA_TEXT, url);
      intent.setTypeAndNormalize("text/plain");
    } else if (url != null && isFileUrl(url)) {
      String type = getMimeType(url);
      intent.setType(type);
      Uri fileUrl = FileProvider.getUriForFile(getActivity(), getContext().getPackageName() + ".fileprovider", new File(Uri.parse(url).getPath()));
      intent.putExtra(Intent.EXTRA_STREAM, fileUrl);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        intent.setData(fileUrl);
      }
      intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
    }

    if (title != null) {
      intent.putExtra(Intent.EXTRA_SUBJECT, title);
    }

    Intent chooser = Intent.createChooser(intent, dialogTitle);
    chooser.addCategory(Intent.CATEGORY_DEFAULT);

    getActivity().startActivity(chooser);
    call.success();
  }

  private String getMimeType(String url) {
    String type = null;
    String extension = MimeTypeMap.getFileExtensionFromUrl(url);
    if (extension != null) {
      type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
    }
    return type;
  }

  private boolean isFileUrl(String url) {
    return url.startsWith("file:");
  }

  private boolean isHttpUrl(String url) {
    return url.startsWith("http");
  }
}
