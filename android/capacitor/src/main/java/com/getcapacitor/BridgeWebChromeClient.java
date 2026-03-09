package com.getcapacitor;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.MimeTypeMap;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.EditText;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.FileProvider;
import com.getcapacitor.util.PermissionHelper;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Locale;

/**
 * Custom WebChromeClient handler, required for showing dialogs, confirms, etc. in our
 * WebView instance.
 */
public class BridgeWebChromeClient extends WebChromeClient {

    private interface PermissionListener {
        void onPermissionSelect(Boolean isGranted);
    }

    private interface ActivityResultListener {
        void onActivityResult(ActivityResult result);
    }

    private ActivityResultLauncher permissionLauncher;
    private ActivityResultLauncher activityLauncher;
    private PermissionListener permissionListener;
    private ActivityResultListener activityListener;

    private Bridge bridge;

    // Security fix: track granted permissions per origin
    private final Map<String, Set<String>> grantedPermissionsByOrigin = new HashMap<>();
    private static final String ORIGIN_PERMISSION_CAMERA = "camera";
    private static final String ORIGIN_PERMISSION_MICROPHONE = "microphone";
    private static final String ORIGIN_PERMISSION_GEOLOCATION = "geolocation";

    public BridgeWebChromeClient(Bridge bridge) {
        this.bridge = bridge;

        ActivityResultCallback<Map<String, Boolean>> permissionCallback = (Map<String, Boolean> isGranted) -> {
            if (permissionListener != null) {
                boolean granted = true;
                for (Map.Entry<String, Boolean> permission : isGranted.entrySet()) {
                    if (!permission.getValue()) granted = false;
                }
                permissionListener.onPermissionSelect(granted);
            }
        };

        permissionLauncher = bridge.registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), permissionCallback);
        activityLauncher = bridge.registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), (result) -> {
            if (activityListener != null) {
                activityListener.onActivityResult(result);
            }
        });
    }

    /**
     * Render web content in `view`.
     *
     * Both this method and {@link #onHideCustomView()} are required for
     * rendering web content in full screen.
     *
     * @see <a href="https://developer.android.com/reference/android/webkit/WebChromeClient#onShowCustomView(android.view.View,%20android.webkit.WebChromeClient.CustomViewCallback)">onShowCustomView() docs</a>
     */
    @Override
    public void onShowCustomView(View view, CustomViewCallback callback) {
        callback.onCustomViewHidden();
        super.onShowCustomView(view, callback);
    }

    /**
     * Render web content in the original Web View again.
     *
     * Do not remove this method--@see #onShowCustomView(View, CustomViewCallback).
     */
    @Override
    public void onHideCustomView() {
        super.onHideCustomView();
    }

    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        String origin = normalizeOrigin(request.getOrigin());
        Set<String> requestedOriginPerms = getRequestedMediaOriginPermissions(request.getResources());
        Set<String> missingOriginPerms = getMissingOriginPermissions(origin, requestedOriginPerms);

        if (missingOriginPerms.isEmpty()) {
            // This origin already has these permissions — just check Android-level grants
            launchAndroidPermissionRequest(request, requestedOriginPerms, origin);
            return;
        }

        // New origin or new permission type — show dialog first
        Activity activity = bridge.getActivity();
        if (activity == null || activity.isFinishing()) {
            safeGrant(request, request.getResources());
            return;
        }

        String originName = getOriginDisplayName(origin, bridge.getContext());
        String permLabel = buildPermissionLabel(missingOriginPerms, bridge.getContext());
        String message = getResString(bridge.getContext(), "web_permission_prompt", originName, permLabel);
        String allowLabel = getResString(bridge.getContext(), "web_permission_allow");
        String denyLabel = getResString(bridge.getContext(), "web_permission_deny");

        activity.runOnUiThread(() -> {
            if (activity.isFinishing()) { safeDeny(request); return; }
            new androidx.appcompat.app.AlertDialog.Builder(activity)
                .setMessage(message)
                .setCancelable(false)
                .setPositiveButton(allowLabel, (d, w) -> launchAndroidPermissionRequest(request, requestedOriginPerms, origin))
                .setNegativeButton(denyLabel, (d, w) -> safeDeny(request))
                .show();
        });
    }

    private void launchAndroidPermissionRequest(
        PermissionRequest request,
        Set<String> requestedOriginPerms,
        String origin
    ) {
        List<String> androidPerms = new ArrayList<>();
        List<String> resources = Arrays.asList(request.getResources());
        if (resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
            androidPerms.add(Manifest.permission.CAMERA);
        }
        if (resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
            androidPerms.add(Manifest.permission.MODIFY_AUDIO_SETTINGS);
            androidPerms.add(Manifest.permission.RECORD_AUDIO);
        }
        if (androidPerms.isEmpty()) {
            safeGrant(request, request.getResources());
            return;
        }
        permissionListener = isGranted -> {
            if (isGranted) {
                grantOriginPermissions(origin, requestedOriginPerms);
                safeGrant(request, request.getResources());
            } else {
                safeDeny(request);
            }
        };
        permissionLauncher.launch(androidPerms.toArray(new String[0]));
    }

    /**
     * Show the browser alert modal
     * @param view
     * @param url
     * @param message
     * @param result
     * @return
     */
    @Override
    public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
        if (bridge.getActivity().isFinishing()) {
            return true;
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(view.getContext());
        builder
            .setMessage(message)
            .setPositiveButton("OK", (dialog, buttonIndex) -> {
                dialog.dismiss();
                result.confirm();
            })
            .setOnCancelListener((dialog) -> {
                dialog.dismiss();
                result.cancel();
            });

        AlertDialog dialog = builder.create();

        dialog.show();

        return true;
    }

    /**
     * Show the browser confirm modal
     * @param view
     * @param url
     * @param message
     * @param result
     * @return
     */
    @Override
    public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
        if (bridge.getActivity().isFinishing()) {
            return true;
        }

        final AlertDialog.Builder builder = new AlertDialog.Builder(view.getContext());

        builder
            .setMessage(message)
            .setPositiveButton("OK", (dialog, buttonIndex) -> {
                dialog.dismiss();
                result.confirm();
            })
            .setNegativeButton("Cancel", (dialog, buttonIndex) -> {
                dialog.dismiss();
                result.cancel();
            })
            .setOnCancelListener((dialog) -> {
                dialog.dismiss();
                result.cancel();
            });

        AlertDialog dialog = builder.create();

        dialog.show();

        return true;
    }

    /**
     * Show the browser prompt modal
     * @param view
     * @param url
     * @param message
     * @param defaultValue
     * @param result
     * @return
     */
    @Override
    public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, final JsPromptResult result) {
        if (bridge.getActivity().isFinishing()) {
            return true;
        }

        final AlertDialog.Builder builder = new AlertDialog.Builder(view.getContext());
        final EditText input = new EditText(view.getContext());

        builder
            .setMessage(message)
            .setView(input)
            .setPositiveButton("OK", (dialog, buttonIndex) -> {
                dialog.dismiss();

                String inputText1 = input.getText().toString().trim();
                result.confirm(inputText1);
            })
            .setNegativeButton("Cancel", (dialog, buttonIndex) -> {
                dialog.dismiss();
                result.cancel();
            })
            .setOnCancelListener((dialog) -> {
                dialog.dismiss();
                result.cancel();
            });

        AlertDialog dialog = builder.create();

        dialog.show();

        return true;
    }

    /**
     * Handle the browser geolocation permission prompt
     * @param origin
     * @param callback
     */
    @Override
    public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
        super.onGeolocationPermissionsShowPrompt(origin, callback);
        Logger.debug("onGeolocationPermissionsShowPrompt: DOING IT HERE FOR ORIGIN: " + origin);

        String normalizedOrigin = normalizeOrigin(origin);

        if (hasOriginPermission(normalizedOrigin, ORIGIN_PERMISSION_GEOLOCATION)) {
            // Already allowed for this origin — just request Android-level if needed
            launchGeoAndroidPermission(origin, normalizedOrigin, callback);
            return;
        }

        Activity activity = bridge.getActivity();
        if (activity == null || activity.isFinishing()) {
            launchGeoAndroidPermission(origin, normalizedOrigin, callback);
            return;
        }

        String originName = getOriginDisplayName(normalizedOrigin, bridge.getContext());
        Set<String> geoSet = Collections.singleton(ORIGIN_PERMISSION_GEOLOCATION);
        String permLabel = buildPermissionLabel(geoSet, bridge.getContext());
        String message = getResString(bridge.getContext(), "web_permission_prompt", originName, permLabel);
        String allowLabel = getResString(bridge.getContext(), "web_permission_allow");
        String denyLabel = getResString(bridge.getContext(), "web_permission_deny");

        activity.runOnUiThread(() -> {
            if (activity.isFinishing()) { callback.invoke(origin, false, false); return; }
            new androidx.appcompat.app.AlertDialog.Builder(activity)
                .setMessage(message)
                .setCancelable(false)
                .setPositiveButton(allowLabel, (d, w) -> launchGeoAndroidPermission(origin, normalizedOrigin, callback))
                .setNegativeButton(denyLabel, (d, w) -> callback.invoke(origin, false, false))
                .show();
        });
    }

    private void launchGeoAndroidPermission(String origin, String normalizedOrigin, GeolocationPermissions.Callback callback) {
        final String[] geoPermissions = { Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION };

        if (!PermissionHelper.hasPermissions(bridge.getContext(), geoPermissions)) {
            permissionListener = (isGranted) -> {
                if (isGranted) {
                    grantOriginPermissions(normalizedOrigin, Collections.singleton(ORIGIN_PERMISSION_GEOLOCATION));
                    callback.invoke(origin, true, false);
                } else {
                    final String[] coarsePermission = { Manifest.permission.ACCESS_COARSE_LOCATION };
                    if (
                        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                        PermissionHelper.hasPermissions(bridge.getContext(), coarsePermission)
                    ) {
                        grantOriginPermissions(normalizedOrigin, Collections.singleton(ORIGIN_PERMISSION_GEOLOCATION));
                        callback.invoke(origin, true, false);
                    } else {
                        callback.invoke(origin, false, false);
                    }
                }
            };
            permissionLauncher.launch(geoPermissions);
        } else {
            grantOriginPermissions(normalizedOrigin, Collections.singleton(ORIGIN_PERMISSION_GEOLOCATION));
            callback.invoke(origin, true, false);
            Logger.debug("onGeolocationPermissionsShowPrompt: has required permission");
        }
    }

    @Override
    public boolean onShowFileChooser(
        WebView webView,
        final ValueCallback<Uri[]> filePathCallback,
        final FileChooserParams fileChooserParams
    ) {
        List<String> acceptTypes = Arrays.asList(fileChooserParams.getAcceptTypes());
        boolean captureEnabled = fileChooserParams.isCaptureEnabled();
        boolean capturePhoto = captureEnabled && acceptTypes.contains("image/*");
        final boolean captureVideo = captureEnabled && acceptTypes.contains("video/*");
        if ((capturePhoto || captureVideo)) {
            if (isMediaCaptureSupported()) {
                showMediaCaptureOrFilePicker(filePathCallback, fileChooserParams, captureVideo);
            } else {
                permissionListener = (isGranted) -> {
                    if (isGranted) {
                        showMediaCaptureOrFilePicker(filePathCallback, fileChooserParams, captureVideo);
                    } else {
                        Logger.warn(Logger.tags("FileChooser"), "Camera permission not granted");
                        filePathCallback.onReceiveValue(null);
                    }
                };
                final String[] camPermission = { Manifest.permission.CAMERA };
                permissionLauncher.launch(camPermission);
            }
        } else {
            showFilePicker(filePathCallback, fileChooserParams);
        }

        return true;
    }

    private boolean isMediaCaptureSupported() {
        String[] permissions = { Manifest.permission.CAMERA };
        return (
            PermissionHelper.hasPermissions(bridge.getContext(), permissions) ||
            !PermissionHelper.hasDefinedPermission(bridge.getContext(), Manifest.permission.CAMERA)
        );
    }

    private void showMediaCaptureOrFilePicker(ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams, boolean isVideo) {
        boolean shown;
        if (isVideo) {
            shown = showVideoCapturePicker(filePathCallback);
        } else {
            shown = showImageCapturePicker(filePathCallback);
        }
        if (!shown) {
            Logger.warn(Logger.tags("FileChooser"), "Media capture intent could not be launched. Falling back to default file picker.");
            showFilePicker(filePathCallback, fileChooserParams);
        }
    }

    @SuppressLint("QueryPermissionsNeeded")
    private boolean showImageCapturePicker(final ValueCallback<Uri[]> filePathCallback) {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(bridge.getActivity().getPackageManager()) == null) {
            return false;
        }

        final Uri imageFileUri;
        try {
            imageFileUri = createImageFileUri();
        } catch (Exception ex) {
            Logger.error("Unable to create temporary media capture file: " + ex.getMessage());
            return false;
        }
        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, imageFileUri);
        activityListener = (activityResult) -> {
            Uri[] result = null;
            if (activityResult.getResultCode() == Activity.RESULT_OK) {
                result = new Uri[] { imageFileUri };
            }
            filePathCallback.onReceiveValue(result);
        };
        activityLauncher.launch(takePictureIntent);

        return true;
    }

    @SuppressLint("QueryPermissionsNeeded")
    private boolean showVideoCapturePicker(final ValueCallback<Uri[]> filePathCallback) {
        Intent takeVideoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        if (takeVideoIntent.resolveActivity(bridge.getActivity().getPackageManager()) == null) {
            return false;
        }

        activityListener = (activityResult) -> {
            Uri[] result = null;
            if (activityResult.getResultCode() == Activity.RESULT_OK) {
                result = new Uri[] { activityResult.getData().getData() };
            }
            filePathCallback.onReceiveValue(result);
        };
        activityLauncher.launch(takeVideoIntent);

        return true;
    }

    private void showFilePicker(final ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        Intent intent = fileChooserParams.createIntent();
        if (fileChooserParams.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) {
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        }
        if (fileChooserParams.getAcceptTypes().length > 1 || intent.getType().startsWith(".")) {
            String[] validTypes = getValidTypes(fileChooserParams.getAcceptTypes());
            intent.putExtra(Intent.EXTRA_MIME_TYPES, validTypes);
            if (intent.getType().startsWith(".")) {
                intent.setType(validTypes[0]);
            }
        }
        try {
            activityListener = (activityResult) -> {
                Uri[] result;
                Intent resultIntent = activityResult.getData();
                if (activityResult.getResultCode() == Activity.RESULT_OK && resultIntent.getClipData() != null) {
                    final int numFiles = resultIntent.getClipData().getItemCount();
                    result = new Uri[numFiles];
                    for (int i = 0; i < numFiles; i++) {
                        result[i] = resultIntent.getClipData().getItemAt(i).getUri();
                    }
                } else {
                    result = WebChromeClient.FileChooserParams.parseResult(activityResult.getResultCode(), resultIntent);
                }
                filePathCallback.onReceiveValue(result);
            };
            activityLauncher.launch(intent);
        } catch (ActivityNotFoundException e) {
            filePathCallback.onReceiveValue(null);
        }
    }

    private String[] getValidTypes(String[] currentTypes) {
        List<String> validTypes = new ArrayList<>();
        MimeTypeMap mtm = MimeTypeMap.getSingleton();
        for (String mime : currentTypes) {
            if (mime.startsWith(".")) {
                String extension = mime.substring(1);
                String extensionMime = mtm.getMimeTypeFromExtension(extension);
                if (extensionMime != null && !validTypes.contains(extensionMime)) {
                    validTypes.add(extensionMime);
                }
            } else if (!validTypes.contains(mime)) {
                validTypes.add(mime);
            }
        }
        Object[] validObj = validTypes.toArray();
        return Arrays.copyOf(validObj, validObj.length, String[].class);
    }

    @Override
    public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
        String tag = Logger.tags("Console");
        if (consoleMessage.message() != null && isValidMsg(consoleMessage.message())) {
            String msg = String.format(
                "File: %s - Line %d - Msg: %s",
                consoleMessage.sourceId(),
                consoleMessage.lineNumber(),
                consoleMessage.message()
            );
            String level = consoleMessage.messageLevel().name();
            if ("ERROR".equalsIgnoreCase(level)) {
                Logger.error(tag, msg, null);
            } else if ("WARNING".equalsIgnoreCase(level)) {
                Logger.warn(tag, msg);
            } else if ("TIP".equalsIgnoreCase(level)) {
                Logger.debug(tag, msg);
            } else {
                Logger.info(tag, msg);
            }
        }
        return true;
    }

    public boolean isValidMsg(String msg) {
        return !(msg.contains("%cresult %c") || (msg.contains("%cnative %c")) || msg.equalsIgnoreCase("console.groupEnd"));
    }

    private Uri createImageFileUri() throws IOException {
        Activity activity = bridge.getActivity();
        File photoFile = createImageFile(activity);
        return FileProvider.getUriForFile(activity, bridge.getContext().getPackageName() + ".fileprovider", photoFile);
    }

    private File createImageFile(Activity activity) throws IOException {
        // Create an image file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES);

        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    // ---- Per-origin permission tracking ----

    private Set<String> getRequestedMediaOriginPermissions(String[] resources) {
        Set<String> perms = new HashSet<>();
        for (String r : resources) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) perms.add(ORIGIN_PERMISSION_CAMERA);
            else if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) perms.add(ORIGIN_PERMISSION_MICROPHONE);
        }
        return perms;
    }

    private Set<String> getMissingOriginPermissions(String origin, Set<String> requested) {
        Set<String> missing = new HashSet<>();
        for (String p : requested) {
            if (!hasOriginPermission(origin, p)) missing.add(p);
        }
        return missing;
    }

    private boolean hasOriginPermission(String origin, String key) {
        Set<String> perms = grantedPermissionsByOrigin.get(origin);
        return perms != null && perms.contains(key);
    }

    private void grantOriginPermissions(String origin, Set<String> keys) {
        if (keys.isEmpty()) return;
        Set<String> perms = grantedPermissionsByOrigin.get(origin);
        if (perms == null) { perms = new HashSet<>(); grantedPermissionsByOrigin.put(origin, perms); }
        perms.addAll(keys);
    }

    private String normalizeOrigin(Uri uri) {
        if (uri == null) return "";
        String scheme = uri.getScheme(), host = uri.getHost();
        if (scheme == null || host == null) return uri.toString();
        StringBuilder sb = new StringBuilder()
            .append(scheme.toLowerCase(Locale.US)).append("://").append(host.toLowerCase(Locale.US));
        if (uri.getPort() != -1) sb.append(":").append(uri.getPort());
        return sb.toString();
    }

    private String normalizeOrigin(String origin) {
        if (origin == null || origin.isEmpty()) return "";
        try { return normalizeOrigin(Uri.parse(origin)); } catch (Exception e) { return origin; }
    }

    private String buildPermissionLabel(Set<String> perms, android.content.Context ctx) {
        List<String> labels = new ArrayList<>();
        if (perms.contains(ORIGIN_PERMISSION_CAMERA))       labels.add(getResString(ctx, "web_permission_camera"));
        if (perms.contains(ORIGIN_PERMISSION_MICROPHONE))   labels.add(getResString(ctx, "web_permission_microphone"));
        if (perms.contains(ORIGIN_PERMISSION_GEOLOCATION))  labels.add(getResString(ctx, "web_permission_location"));
        if (labels.isEmpty()) return getResString(ctx, "web_permission_device_features");
        if (labels.size() == 1) return labels.get(0);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < labels.size(); i++) {
            if (i > 0) sb.append(i == labels.size() - 1 ? " and " : ", ");
            sb.append(labels.get(i));
        }
        return sb.toString();
    }

    private String getOriginDisplayName(String origin, android.content.Context ctx) {
        if (origin == null || origin.isEmpty()) return getResString(ctx, "web_permission_this_site");
        try {
            String host = Uri.parse(origin).getHost();
            return (host != null && !host.isEmpty()) ? host : origin;
        } catch (Exception e) { return origin; }
    }

    private String getResString(android.content.Context ctx, String name) {
        int id = ctx.getResources().getIdentifier(name, "string", ctx.getPackageName());
        return id != 0 ? ctx.getString(id) : name;
    }

    private String getResString(android.content.Context ctx, String name, Object... args) {
        int id = ctx.getResources().getIdentifier(name, "string", ctx.getPackageName());
        return id != 0 ? ctx.getString(id, args) : name;
    }

    private void safeGrant(PermissionRequest request, String[] resources) {
        try { request.grant(resources); }
        catch (IllegalStateException e) { Logger.warn("BridgeWebChromeClient", "Permission request already processed: " + e.getMessage()); }
    }

    private void safeDeny(PermissionRequest request) {
        try { request.deny(); }
        catch (IllegalStateException e) { Logger.warn("BridgeWebChromeClient", "Permission request already processed: " + e.getMessage()); }
    }
}
