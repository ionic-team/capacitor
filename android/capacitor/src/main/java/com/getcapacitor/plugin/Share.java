package com.getcapacitor.plugin;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.webkit.MimeTypeMap;

import androidx.core.content.FileProvider;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import java.io.File;
import java.util.List;

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

    Uri fileUrl = null;
    
    if(url != null && isHttpUrl(url) && text == null) {
      intent.putExtra(Intent.EXTRA_TEXT, url);
      intent.setTypeAndNormalize("text/plain");
    } else if (url != null && isFileUrl(url)) {
      String type = getMimeType(url);
      intent.setType(type);
      fileUrl = FileProvider.getUriForFile(getActivity(), getContext().getPackageName() + ".fileprovider", new File(Uri.parse(url).getPath()));
      intent.putExtra(Intent.EXTRA_STREAM, fileUrl);
    }

    if (title != null) {
      intent.putExtra(Intent.EXTRA_SUBJECT, title);
    }

    Intent chooser = Intent.createChooser(intent, dialogTitle);
    chooser.addCategory(Intent.CATEGORY_DEFAULT);

    if (fileUrl != null) {
      List<ResolveInfo> resInfoList = getContext().getPackageManager().queryIntentActivities(chooser, PackageManager.MATCH_DEFAULT_ONLY);

      for (ResolveInfo resolveInfo : resInfoList) {
        String packageName = resolveInfo.activityInfo.packageName;
        getContext().grantUriPermission(packageName, fileUrl, Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
      }
    }
    
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
