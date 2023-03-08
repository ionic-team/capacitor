package com.getcapacitor.util;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;

public class InternalUtils {

    public static PackageInfo getPackageInfo(PackageManager pm, String packageName) throws PackageManager.NameNotFoundException {
        return InternalUtils.getPackageInfo(pm, packageName, 0);
    }

    public static PackageInfo getPackageInfo(PackageManager pm, String packageName, long flags)
        throws PackageManager.NameNotFoundException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return pm.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(flags));
        } else {
            return getPackageInfoLegacy(pm, packageName, (int) flags);
        }
    }

    @SuppressWarnings("deprecation")
    private static PackageInfo getPackageInfoLegacy(PackageManager pm, String packageName, long flags)
        throws PackageManager.NameNotFoundException {
        return pm.getPackageInfo(packageName, (int) flags);
    }
}
