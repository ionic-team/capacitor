package com.getcapacitor.util;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A helper class for checking permissions.
 *
 * @since 3.0.0
 */
public class PermissionHelper {

    /**
     * Local-network access runtime permission introduced in API 37.
     * Kept as a string literal even though the default compile SDK is 37,
     * because consumers can override the compile SDK below API 37 via the
     * compileSdkVersion Gradle property, in which case
     * Manifest.permission.ACCESS_LOCAL_NETWORK is not available at compile time.
     *
     * @since 9.0.0
     */
    public static final String ACCESS_LOCAL_NETWORK = "android.permission.ACCESS_LOCAL_NETWORK";

    /**
     * API level that introduced the local-network runtime permission.
     * Kept as a literal because there is no compile-time guarantee that a
     * Build.VERSION_CODES constant exists for API 37 (builds may use a compile
     * SDK below 37 via the compileSdkVersion Gradle property).
     *
     * @since 9.0.0
     */
    public static final int ANDROID_API_LOCAL_NETWORK_PERMISSION = 37;

    /**
     * Checks whether the given permission string is the local-network permission.
     *
     * @since 9.0.0
     * @param permission A permission string to check.
     * @return True if it matches the local-network permission, false otherwise (including null).
     */
    public static boolean isLocalNetworkPermission(String permission) {
        return ACCESS_LOCAL_NETWORK.equals(permission);
    }

    /**
     * Checks whether the local-network runtime permission is enforced on this device.
     *
     * @since 9.0.0
     * @return True on API 37+, false on older SDKs where the permission is unknown.
     */
    public static boolean isLocalNetworkPermissionEnforced() {
        return isLocalNetworkPermissionEnforced(Build.VERSION.SDK_INT);
    }

    /**
     * Checks whether the local-network runtime permission is enforced for the given API level.
     * Exists so both sides of the API-37 gate are unit-testable on the JVM.
     *
     * @since 9.0.0
     * @param sdkInt An API level, e.g. Build.VERSION.SDK_INT.
     * @return True on API 37+, false on older SDKs where the permission is unknown.
     */
    public static boolean isLocalNetworkPermissionEnforced(int sdkInt) {
        return sdkInt >= ANDROID_API_LOCAL_NETWORK_PERMISSION;
    }

    /**
     * Checks whether the given permission is enforced on this device.
     * The local-network permission is only enforced on API 37+; on older SDKs it
     * is unknown to PackageManager and must be treated as granted.
     * All other permissions are always enforced.
     *
     * @since 9.0.0
     * @param permission A permission string to check.
     * @return False only for the local-network permission on SDK < 37, true otherwise.
     */
    public static boolean isPermissionEnforced(String permission) {
        return isPermissionEnforced(permission, Build.VERSION.SDK_INT);
    }

    /**
     * Checks whether the given permission is enforced for the given API level.
     * Exists so both sides of the API-37 gate are unit-testable on the JVM.
     *
     * @since 9.0.0
     * @param permission A permission string to check.
     * @param sdkInt An API level, e.g. Build.VERSION.SDK_INT.
     * @return False only for the local-network permission on SDK < 37, true otherwise.
     */
    public static boolean isPermissionEnforced(String permission, int sdkInt) {
        if (isLocalNetworkPermission(permission) && !isLocalNetworkPermissionEnforced(sdkInt)) {
            return false;
        }
        return true;
    }

    /**
     * Checks if a list of given permissions are all granted by the user
     *
     * @since 3.0.0
     * @param permissions Permissions to check.
     * @return True if all permissions are granted, false if at least one is not.
     */
    public static boolean hasPermissions(Context context, String[] permissions) {
        for (String perm : permissions) {
            if (ActivityCompat.checkSelfPermission(context, perm) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check whether the given permission has been defined in the AndroidManifest.xml
     *
     * @since 3.0.0
     * @param permission A permission to check.
     * @return True if the permission has been defined in the Manifest, false if not.
     */
    public static boolean hasDefinedPermission(Context context, String permission) {
        boolean hasPermission = false;
        String[] requestedPermissions = PermissionHelper.getManifestPermissions(context);
        if (requestedPermissions != null && requestedPermissions.length > 0) {
            List<String> requestedPermissionsList = Arrays.asList(requestedPermissions);
            ArrayList<String> requestedPermissionsArrayList = new ArrayList<>(requestedPermissionsList);
            if (requestedPermissionsArrayList.contains(permission)) {
                hasPermission = true;
            }
        }
        return hasPermission;
    }

    /**
     * Check whether all of the given permissions have been defined in the AndroidManifest.xml
     * @param context the app context
     * @param permissions a list of permissions
     * @return true only if all permissions are defined in the AndroidManifest.xml
     */
    public static boolean hasDefinedPermissions(Context context, String[] permissions) {
        for (String permission : permissions) {
            if (!PermissionHelper.hasDefinedPermission(context, permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the permissions defined in AndroidManifest.xml
     *
     * @since 3.0.0
     * @return The permissions defined in AndroidManifest.xml
     */
    public static String[] getManifestPermissions(Context context) {
        String[] requestedPermissions = null;
        try {
            PackageManager pm = context.getPackageManager();
            PackageInfo packageInfo = InternalUtils.getPackageInfo(pm, context.getPackageName(), PackageManager.GET_PERMISSIONS);

            if (packageInfo != null) {
                requestedPermissions = packageInfo.requestedPermissions;
            }
        } catch (Exception ex) {}
        return requestedPermissions;
    }

    /**
     * Given a list of permissions, return a new list with the ones not present in AndroidManifest.xml
     *
     * @since 3.0.0
     * @param neededPermissions The permissions needed.
     * @return The permissions not present in AndroidManifest.xml
     */
    public static String[] getUndefinedPermissions(Context context, String[] neededPermissions) {
        ArrayList<String> undefinedPermissions = new ArrayList<>();
        String[] requestedPermissions = getManifestPermissions(context);
        if (requestedPermissions != null && requestedPermissions.length > 0) {
            List<String> requestedPermissionsList = Arrays.asList(requestedPermissions);
            ArrayList<String> requestedPermissionsArrayList = new ArrayList<>(requestedPermissionsList);
            for (String permission : neededPermissions) {
                if (!requestedPermissionsArrayList.contains(permission)) {
                    undefinedPermissions.add(permission);
                }
            }
            String[] undefinedPermissionArray = new String[undefinedPermissions.size()];
            undefinedPermissionArray = undefinedPermissions.toArray(undefinedPermissionArray);

            return undefinedPermissionArray;
        }
        return neededPermissions;
    }
}
