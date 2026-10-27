package com.iron.muscletracker;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {
    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url", "");
        // Only accept this repository's versioned release APKs.
        if (!url.matches("https://github\\.com/iamminseongKim/iron-muscle/releases/download/(v?\\d+\\.\\d+\\.\\d+)/IronMuscle-\\1\\.apk")) {
            call.reject("Invalid release URL");
            return;
        }
        try {
            Uri uri = Uri.parse(url);
            DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request request = new DownloadManager.Request(uri)
                .setTitle(uri.getLastPathSegment())
                .setMimeType("application/vnd.android.package-archive")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalFilesDir(getContext(), Environment.DIRECTORY_DOWNLOADS, System.currentTimeMillis() + "-" + uri.getLastPathSegment());
            manager.enqueue(request);
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not start download", error);
        }
    }
}
