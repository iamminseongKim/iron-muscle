package com.iron.muscletracker;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {
    @PluginMethod
    public void openInBrowser(PluginCall call) {
        String url = call.getString("url", "");
        // Only accept this repository's versioned release APKs.
        if (!url.matches("https://github\\.com/iamminseongKim/iron-muscle/releases/download/(v?\\d+\\.\\d+\\.\\d+)/IronMuscle-\\1\\.apk")) {
            call.reject("Invalid release URL");
            return;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not open browser", error);
        }
    }
}
