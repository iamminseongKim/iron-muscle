package com.iron.muscletracker;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WorkoutBackupPlugin.class);
        registerPlugin(AppUpdaterPlugin.class);
        super.onCreate(savedInstanceState);
        // Keep Android's normal text selection/paste UI for notes and backup JSON.
    }
}
