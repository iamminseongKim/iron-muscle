import Foundation
import Capacitor
import HealthKit

@objc(IronHealthPlugin)
public class IronHealthPlugin: CAPPlugin {
    private let store = HKHealthStore()
    private let weight = HKObjectType.quantityType(forIdentifier: .bodyMass)!
    @objc func status(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable(),
                      "writeWorkout": store.authorizationStatus(for: HKObjectType.workoutType()) == .sharingAuthorized])
    }
    @objc func authorize(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("HealthKit unavailable"); return }
        var read = Set<HKObjectType>()
        var write = Set<HKSampleType>()
        if call.getBool("readWeight") == true { read.insert(weight) }
        if call.getBool("writeWorkout") == true { write.insert(HKObjectType.workoutType()) }
        store.requestAuthorization(toShare: write, read: read) { success, error in
            if let error = error { call.reject("Cannot request health permissions", nil, error) }
            else if success { call.resolve() }
            else { call.reject("Health authorization cancelled") }
        }
    }
    @objc func latestWeight(_ call: CAPPluginCall) {
        let now = Date()
        let predicate = HKQuery.predicateForSamples(withStart: now.addingTimeInterval(-29 * 86400), end: now, options: .strictEndDate)
        let query = HKSampleQuery(sampleType: weight, predicate: predicate, limit: 1,
                                  sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]) { _, samples, error in
            if let error = error { call.reject("Cannot read weight", nil, error); return }
            guard let sample = samples?.first as? HKQuantitySample else { call.resolve(); return }
            call.resolve(["kg": sample.quantity.doubleValue(for: .gramUnit(with: .kilo)),
                          "measuredAt": ISO8601DateFormatter().string(from: sample.endDate)])
        }
        store.execute(query)
    }
    private func date(_ value: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: value) ?? ISO8601DateFormatter().date(from: value)
    }
    @objc func writeWorkout(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), !id.isEmpty, id.count < 200,
              let startValue = call.getString("startTime"), let start = date(startValue),
              let endValue = call.getString("endTime"), let end = date(endValue), end > start,
              end <= Date().addingTimeInterval(60) else { call.reject("Invalid workout"); return }
        // HealthKit's sync identifier/version replaces duplicate submissions, including retries after a crash.
        let workout = HKWorkout(activityType: .traditionalStrengthTraining, start: start, end: end,
                                duration: end.timeIntervalSince(start), totalEnergyBurned: nil, totalDistance: nil,
                                metadata: [HKMetadataKeySyncIdentifier: "iron-muscle:\(id)", HKMetadataKeySyncVersion: 1])
        store.save(workout) { success, error in
            if success { call.resolve() }
            else { call.reject("Cannot save workout", nil, error) }
        }
    }
    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let url = URL(string: UIApplication.openSettingsURLString) else { call.reject("Cannot open settings"); return }
            UIApplication.shared.open(url, options: [:]) { success in
                if success { call.resolve() } else { call.reject("Cannot open settings") }
            }
        }
    }
}
