package com.iron.health

import android.app.Activity
import android.os.Bundle
import android.webkit.WebView

class HealthPrivacyActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val view = WebView(this)
        setContentView(view)
        view.loadUrl("file:///android_asset/public/health-privacy.html")
    }
}
