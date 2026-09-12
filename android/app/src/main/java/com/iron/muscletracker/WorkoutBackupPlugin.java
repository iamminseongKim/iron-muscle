package com.iron.muscletracker;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "WorkoutBackup")
public class WorkoutBackupPlugin extends Plugin {
    @PluginMethod
    public void save(PluginCall call) {
        if (call.getString("data") == null) { call.reject("백업 내용이 없습니다."); return; }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        String filename = call.getString("filename", "iron-muscle-backup.json");
        String mimeType = call.getString("mimeType");
        if (mimeType == null || mimeType.isEmpty()) {
            if (filename.endsWith(".md") || filename.endsWith(".markdown") || filename.endsWith(".txt")) {
                mimeType = "text/*";
            } else {
                mimeType = "application/json";
            }
        }
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        startActivityForResult(call, intent, "onFileCreated");
    }

    @ActivityCallback
    private void onFileCreated(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject response = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            response.put("cancelled", true); call.resolve(response); return;
        }
        try (OutputStream out = getContext().getContentResolver().openOutputStream(result.getData().getData(), "wt")) {
            if (out == null) throw new Exception("파일을 열 수 없습니다.");
            byte[] bytes = "base64".equals(call.getString("encoding"))
                ? android.util.Base64.decode(call.getString("data", ""), android.util.Base64.DEFAULT)
                : call.getString("data", "").getBytes(StandardCharsets.UTF_8);
            out.write(bytes);
            out.flush();
            response.put("cancelled", false); call.resolve(response);
        } catch (Exception error) { call.reject("백업 파일 저장에 실패했습니다.", error); }
    }
}
