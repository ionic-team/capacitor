import XCTest
@testable import Capacitor

class PluginEventListenerTests: XCTestCase {
    // XCTest creates a new test case instance per test method, so each test gets a fresh plugin
    private let plugin: CAPPlugin = {
        let plugin = CAPPlugin()
        plugin.eventListeners = [:]
        plugin.retainedEventArguments = [:]
        return plugin
    }()

    private func makeListener(
        _ callbackId: String,
        eventName: String = "event",
        onEvent: @escaping (CAPPluginCallResult?, CAPPluginCall?) -> Void = { _, _ in }
    ) -> CAPPluginCall {
        CAPPluginCall(
            callbackId: callbackId,
            methodName: "addListener",
            options: ["eventName": eventName],
            success: onEvent,
            error: { _ in }
        )
    }

    // Runs `body` off the main thread and fails instead of hanging if it deadlocks.
    private func assertCompletes(_ description: String, _ body: @escaping () -> Void) {
        let done = expectation(description: description)
        DispatchQueue.global().async {
            body()
            done.fulfill()
        }
        wait(for: [done], timeout: 5)
    }

    // https://github.com/ionic-team/capacitor/issues/8157
    // Listeners are added and removed on the plugin queue while plugins notify from any thread.
    func testConcurrentListenerMutationAndNotifyIsThreadSafe() {
        let plugin = self.plugin
        let listeners = (0..<64).map { makeListener("listener-\($0)") }

        assertCompletes("concurrent access") {
            DispatchQueue.concurrentPerform(iterations: 20_000) { iteration in
                let listener = listeners[iteration % listeners.count]
                switch iteration % 8 {
                case 0, 1:
                    plugin.addEventListener("event", listener: listener)
                case 2:
                    plugin.removeEventListener("event", listener: listener)
                case 3:
                    plugin.notifyListeners("event", data: ["iteration": iteration])
                case 4:
                    plugin.notifyListeners("event", data: ["iteration": iteration], retainUntilConsumed: true)
                case 5:
                    _ = plugin.hasListeners("event")
                    _ = plugin.getListeners("event")?.count
                case 6:
                    plugin.removeEventListener("event", listener: listeners[(iteration / 8) % listeners.count])
                default:
                    if iteration % 1_000 == 7 {
                        plugin.removeAllListeners(self.makeListener("clear-\(iteration)"))
                    } else {
                        plugin.notifyListeners("event", data: nil)
                    }
                }
            }
        }
    }

    func testRetainedEventsAreDeliveredOnceInOrderToFirstListener() {
        for index in 0..<5 {
            plugin.notifyListeners("event", data: ["index": index], retainUntilConsumed: true)
        }

        var firstReceived: [Int] = []
        plugin.addEventListener("event", listener: makeListener("first") { result, _ in
            firstReceived.append(result?.data?["index"] as? Int ?? -1)
        })
        XCTAssertEqual(firstReceived, [0, 1, 2, 3, 4])
        XCTAssertNil(plugin.retainedEventArguments?["event"])

        var secondReceived: [Int] = []
        plugin.addEventListener("event", listener: makeListener("second") { result, _ in
            secondReceived.append(result?.data?["index"] as? Int ?? -1)
        })
        XCTAssertEqual(secondReceived, [])

        plugin.notifyListeners("event", data: ["index": 5], retainUntilConsumed: true)
        XCTAssertEqual(firstReceived, [0, 1, 2, 3, 4, 5])
        XCTAssertEqual(secondReceived, [5])
        XCTAssertNil(plugin.retainedEventArguments?["event"])
    }

    func testRetainedEventsAreDeliveredAgainAfterAllListenersAreRemoved() {
        let first = makeListener("first")
        plugin.addEventListener("event", listener: first)
        plugin.removeEventListener("event", listener: first)
        plugin.notifyListeners("event", data: ["index": 1], retainUntilConsumed: true)

        var received: [Int] = []
        plugin.addEventListener("event", listener: makeListener("second") { result, _ in
            received.append(result?.data?["index"] as? Int ?? -1)
        })
        XCTAssertEqual(received, [1])
    }

    func testListenerRemovingItselfDuringNotifyDoesNotDeadlock() {
        let plugin = self.plugin
        var calls = 0
        let selfRemoving = makeListener("self-removing") { _, call in
            calls += 1
            if let call {
                plugin.removeEventListener("event", listener: call)
            }
        }
        var otherCalls = 0
        plugin.addEventListener("event", listener: selfRemoving)
        plugin.addEventListener("event", listener: makeListener("other") { _, _ in otherCalls += 1 })

        assertCompletes("notify with self-removing listener") {
            plugin.notifyListeners("event", data: [:])
            plugin.notifyListeners("event", data: [:])
        }
        XCTAssertEqual(calls, 1)
        XCTAssertEqual(otherCalls, 2)
        XCTAssertEqual(plugin.getListeners("event")?.count, 1)
    }

    func testListenerReenteringPluginDuringRetainedDeliveryDoesNotDeadlock() {
        let plugin = self.plugin
        plugin.notifyListeners("event", data: ["index": 0], retainUntilConsumed: true)

        var nestedReceived = 0
        plugin.addEventListener("nested", listener: makeListener("nested", eventName: "nested") { _, _ in
            nestedReceived += 1
        })
        var hadListeners = false
        let reentrant = makeListener("reentrant") { _, _ in
            hadListeners = plugin.hasListeners("event")
            plugin.notifyListeners("nested", data: [:])
            plugin.addEventListener("event", listener: self.makeListener("late"))
        }

        assertCompletes("add listener with retained events") {
            plugin.addEventListener("event", listener: reentrant)
        }
        XCTAssertTrue(hadListeners)
        XCTAssertEqual(nestedReceived, 1)
        XCTAssertEqual(plugin.getListeners("event")?.count, 2)
    }

    func testGetListenersReturnsSnapshot() {
        let first = makeListener("first")
        plugin.addEventListener("event", listener: first)
        let snapshot = plugin.getListeners("event")
        plugin.addEventListener("event", listener: makeListener("second"))
        plugin.removeEventListener("event", listener: first)

        XCTAssertEqual(snapshot?.count, 1)
        XCTAssertTrue(snapshot?.first === first)
        XCTAssertEqual(plugin.getListeners("event")?.count, 1)
        XCTAssertTrue(plugin.hasListeners("event"))
        XCTAssertFalse(plugin.hasListeners("missing"))
        XCTAssertNil(plugin.getListeners("missing"))
    }
}
