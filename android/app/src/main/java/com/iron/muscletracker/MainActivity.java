package com.iron.muscletracker;

import android.view.ActionMode;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public ActionMode onWindowStartingActionMode(ActionMode.Callback callback, int type) {
        // 안드로이드 돋보기/복사/붙여넣기/번역 등 플로팅 액션 모드 툴바 완전 억제
        return null;
    }

    @Override
    public ActionMode onWindowStartingActionMode(ActionMode.Callback callback) {
        // 구형 안드로이드 액션 모드 툴바 억제
        return null;
    }
}
