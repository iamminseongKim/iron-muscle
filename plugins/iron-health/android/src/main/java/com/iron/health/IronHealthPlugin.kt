package com.iron.health

import android.content.Intent
import android.net.Uri
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.*
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.*
import java.time.Instant

@CapacitorPlugin(name = "IronHealth")
class IronHealthPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val readWeight = HealthPermission.getReadPermission(WeightRecord::class)
    private val writeWorkout = HealthPermission.getWritePermission(ExerciseSessionRecord::class)
    private var requesting = false
    private fun available() = HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE
    private fun client() = HealthConnectClient.getOrCreate(context)
    private fun run(call: PluginCall, block: suspend () -> Unit) {
        scope.launch {
            try {
                check(available()) { "Health Connect unavailable" }
                block()
            } catch (e: Exception) {
                call.reject("Health operation failed. Check Health Connect permissions.", "HEALTH_ERROR", e)
            }
        }
    }
    @PluginMethod fun status(call: PluginCall) {
        if (!available()) { call.resolve(JSObject().put("available", false).put("writeWorkout", false)); return }
        run(call) {
            val granted = client().permissionController.getGrantedPermissions()
            call.resolve(JSObject().put("available", true).put("writeWorkout", granted.contains(writeWorkout)))
        }
    }
    @PluginMethod fun authorize(call: PluginCall) {
        if (!available()) { call.reject("Health Connect unavailable"); return }
        if (requesting) { call.reject("Authorization already in progress"); return }
        val permissions = mutableSetOf<String>()
        if (call.getBoolean("readWeight", false) == true) permissions.add(readWeight)
        if (call.getBoolean("writeWorkout", false) == true) permissions.add(writeWorkout)
        if (permissions.isEmpty()) { call.resolve(); return }
        activity.runOnUiThread {
            try {
                requesting = true
                val intent = PermissionController.createRequestPermissionResultContract().createIntent(context, permissions)
                startActivityForResult(call, intent, "authorizationResult")
            } catch (e: Exception) { requesting = false; call.reject("Cannot open permissions", e) }
        }
    }
    @ActivityCallback private fun authorizationResult(call: PluginCall?, result: ActivityResult) {
        requesting = false
        call?.resolve()
    }
    @PluginMethod fun latestWeight(call: PluginCall) = run(call) {
        val response = client().readRecords(ReadRecordsRequest(
            recordType = WeightRecord::class,
            timeRangeFilter = TimeRangeFilter.between(Instant.now().minusSeconds(29L * 86400), Instant.now()),
            ascendingOrder = false, pageSize = 1
        ))
        val record = response.records.firstOrNull()
        val responseData = JSObject()
        if (record != null) {
            responseData.put("kg", record.weight.inKilograms)
            responseData.put("measuredAt", record.time.toString())
        }
        call.resolve(responseData)
    }
    @PluginMethod fun writeWorkout(call: PluginCall) = run(call) {
        val id = requireNotNull(call.getString("id"))
        val start = Instant.parse(requireNotNull(call.getString("startTime")))
        val end = Instant.parse(requireNotNull(call.getString("endTime")))
        require(end > start && end <= Instant.now().plusSeconds(60))
        require(id.isNotBlank() && id.length < 200)
        val record = ExerciseSessionRecord(
            startTime = start, startZoneOffset = null, endTime = end, endZoneOffset = null,
            exerciseType = ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING,
            title = "Iron Muscle",
            metadata = Metadata.activelyRecorded(device = Device(type = Device.TYPE_PHONE), clientRecordId = "iron-muscle:$id", clientRecordVersion = 1)
        )
        client().insertRecords(listOf(record))
        call.resolve()
    }
    @PluginMethod fun openSettings(call: PluginCall) {
        try {
            val intent = if (available()) Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)
                else Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"))
            activity.startActivity(intent)
            call.resolve()
        } catch (e: Exception) { call.reject("Cannot open Health Connect", e) }
    }
    override fun handleOnDestroy() { scope.cancel() }
}
