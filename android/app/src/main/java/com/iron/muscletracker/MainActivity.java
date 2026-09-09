package com.iron.muscletracker;

import android.os.Bundle;
import android.view.ActionMode;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 안드로이드 텍스트 선택 핸들("물방울")이 스크롤 후에도 화면에 잔존하는 문제:
        // CSS(user-select)와 JS(blur/removeAllRanges/disabled 토글) 레벨에서 여러 번
        // 시도해도 해결되지 않아, 근본 원인으로 보이는 WebView의 롱클릭 기반 텍스트
        // 선택 자체를 네이티브 레벨에서 아예 시작되지 않도록 막는다.
        // (트레이드오프: 메모/노트 입력에서 롱프레스로 텍스트를 선택하는 것도 함께 막힘)
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setLongClickable(false);
            webView.setHapticFeedbackEnabled(false);
            webView.setOnLongClickListener(v -> true);
        }
    }

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
