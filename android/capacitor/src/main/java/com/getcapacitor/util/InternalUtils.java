package com.getcapacitor.util;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;

public class InternalUtils {

    public static PackageInfo getPackageInfoLegacy(PackageManager pm, String packageName) throws PackageManager.NameNotFoundException {
        return InternalUtils.getPackageInfoLegacy(pm, packageName, 0);
    }

    @SuppressWarnings("deprecation")
    public static PackageInfo getPackageInfoLegacy(PackageManager pm, String packageName, long flags) throws PackageManager.NameNotFoundException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return pm.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(flags));
        } else {
            return pm.getPackageInfo(packageName, (int) flags);
        }
    }

}
