import Foundation
import Testing
@testable import Capacitor

struct CAPPluginTests {
    private final class Recorder {
        private(set) var received: [PluginCallResultData] = []
        func record(_ data: PluginCallResultData) {
            received.append(data)
        }
    }

    private static func makeCall() -> (call: CAPPluginCall, recorder: Recorder) {
        let recorder = Recorder()
        let call: CAPPluginCall = CAPPluginCall(callbackId: "test", methodName: "test", options: [:], success: { result, _ in
            recorder.record(result?.data ?? [:])
        }, error: { _ in })
        return (call, recorder)
    }

    @Test func notifyListenersDeliversToActiveListener() {
        let plugin = CAPPlugin()
        let (call, recorder) = Self.makeCall()
        plugin.addEventListener("myEvent", listener: call)

        plugin.notifyListeners("myEvent", data: ["value": "hello"])

        #expect(recorder.received.count == 1)
        #expect(recorder.received.first?["value"] as? String == "hello")
    }

    @Test func removeEventListenerStopsDelivery() {
        let plugin = CAPPlugin()
        let (call, recorder) = Self.makeCall()
        plugin.addEventListener("myEvent", listener: call)
        plugin.removeEventListener("myEvent", listener: call)

        plugin.notifyListeners("myEvent", data: ["value": "hello"])

        #expect(recorder.received.isEmpty)
    }

    @Test func hasListenersReflectsAddAndRemove() {
        let plugin = CAPPlugin()
        let (call, _) = Self.makeCall()
        #expect(plugin.hasListeners("myEvent") == false)

        plugin.addEventListener("myEvent", listener: call)
        #expect(plugin.hasListeners("myEvent") == true)

        plugin.removeEventListener("myEvent", listener: call)
        #expect(plugin.hasListeners("myEvent") == false)
    }

    @Test func notifyListenersWithoutListenersAndNoRetainDropsEvent() {
        let plugin = CAPPlugin()
        plugin.notifyListeners("myEvent", data: ["value": "hello"], retainUntilConsumed: false)

        let (call, recorder) = Self.makeCall()
        plugin.addEventListener("myEvent", listener: call)

        #expect(recorder.received.isEmpty)
    }

    @Test func notifyListenersWithoutListenersAndRetainReplaysOnAttach() {
        let plugin = CAPPlugin()
        plugin.notifyListeners("myEvent", data: ["value": "hello"], retainUntilConsumed: true)

        let (call, recorder) = Self.makeCall()
        plugin.addEventListener("myEvent", listener: call)

        #expect(recorder.received.count == 1)
        #expect(recorder.received.first?["value"] as? String == "hello")
    }

    @Test func notifyListenersAfterListenerRemovedStillRetainsAndReplaysOnReattach() {
        let plugin = CAPPlugin()
        let (firstCall, firstRecorder) = Self.makeCall()
        plugin.addEventListener("myEvent", listener: firstCall)
        plugin.removeEventListener("myEvent", listener: firstCall)

        plugin.notifyListeners("myEvent", data: ["value": "hello"], retainUntilConsumed: true)

        let (secondCall, secondRecorder) = Self.makeCall()
        plugin.addEventListener("myEvent", listener: secondCall)

        #expect(firstRecorder.received.isEmpty)
        #expect(secondRecorder.received.count == 1)
        #expect(secondRecorder.received.first?["value"] as? String == "hello")
    }
}
