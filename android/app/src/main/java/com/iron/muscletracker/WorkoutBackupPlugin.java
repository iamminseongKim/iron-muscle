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
    /** Gallery insertion is kept pending until the PNG is fully written and verified. */
    @PluginMethod
    public void saveImage(PluginCall call) {
        android.net.Uri uri = null;
        try {
            byte[] bytes = android.util.Base64.decode(call.getString("data", ""), android.util.Base64.DEFAULT);
            android.graphics.BitmapFactory.Options options = new android.graphics.BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            if (bytes.length < 8 || options.outWidth <= 0 || options.outHeight <= 0 || !"image/png".equals(options.outMimeType)) {
                throw new Exception("유효한 PNG 이미지가 아닙니다.");
            }
            if (android.os.Build.VERSION.SDK_INT < 29) {
                call.getData().put("encoding", "base64");
                call.getData().put("mimeType", "image/png");
                save(call);
                return;
            }
            android.content.ContentResolver resolver = getContext().getContentResolver();
            android.content.ContentValues values = new android.content.ContentValues();
            values.put(android.provider.MediaStore.Images.Media.DISPLAY_NAME, call.getString("filename", "iron-muscle.png"));
            values.put(android.provider.MediaStore.Images.Media.MIME_TYPE, "image/png");
            values.put(android.provider.MediaStore.Images.Media.RELATIVE_PATH, "Pictures/IronMuscle");
            values.put(android.provider.MediaStore.Images.Media.IS_PENDING, 1);
            uri = resolver.insert(android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new Exception("갤러리 파일을 만들 수 없습니다.");
            writeAndVerify(uri, bytes);
            values.clear();
            values.put(android.provider.MediaStore.Images.Media.IS_PENDING, 0);
            if (resolver.update(uri, values, null, null) != 1) throw new Exception("갤러리에 게시하지 못했습니다.");
            JSObject response = new JSObject();
            response.put("cancelled", false);
            response.put("bytesWritten", bytes.length);
            call.resolve(response);
        } catch (Exception error) {
            if (uri != null) try { getContext().getContentResolver().delete(uri, null, null); } catch (Exception ignored) {}
            call.reject("이미지 저장에 실패했습니다. 다시 시도해 주세요.", error);
        }
    }

    private void writeAndVerify(android.net.Uri uri, byte[] bytes) throws Exception {
        if (bytes.length == 0) throw new Exception("빈 파일은 저장할 수 없습니다.");
        try (OutputStream out = getContext().getContentResolver().openOutputStream(uri, "w")) {
            if (out == null) throw new Exception("파일을 열 수 없습니다.");
            out.write(bytes);
            out.flush();
        }
        try (java.io.InputStream in = getContext().getContentResolver().openInputStream(uri)) {
            if (in == null) throw new Exception("저장된 파일을 확인할 수 없습니다.");
            byte[] buffer = new byte[8192];
            int offset = 0, count;
            while ((count = in.read(buffer)) != -1) {
                for (int i = 0; i < count; i++) {
                    if (offset >= bytes.length || bytes[offset++] != buffer[i]) throw new Exception("저장된 파일이 손상되었습니다.");
                }
            }
            if (offset != bytes.length) throw new Exception("저장된 파일이 불완전합니다.");
        }
    }

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
        android.net.Uri uri = result.getData().getData();
        try {
            byte[] bytes = "base64".equals(call.getString("encoding"))
                ? android.util.Base64.decode(call.getString("data", ""), android.util.Base64.DEFAULT)
                : call.getString("data", "").getBytes(StandardCharsets.UTF_8);
            writeAndVerify(uri, bytes);
            response.put("cancelled", false);
            response.put("bytesWritten", bytes.length);
            call.resolve(response);
        } catch (Exception error) {
            try { android.provider.DocumentsContract.deleteDocument(getContext().getContentResolver(), uri); } catch (Exception ignored) {}
            call.reject("파일 저장 및 검증에 실패했습니다.", error);
        }
    }
}
