import Foundation
import Testing
@testable import Capacitor

@objc(SampleMacroPlugin)
@Plugin(jsName: "SampleMacro")
private class SampleMacroPlugin: CAPPlugin {
    @PluginMethod
    func echo(_ call: CAPPluginCall) {
        call.resolve(["value": call.getString("value") ?? ""])
    }

    @PluginMethod(returnType: .none)
    func ping(_ call: CAPPluginCall) throws {
        call.resolve()
    }
}

struct PluginMacroTests {
    @Test func generatesBridgeMetadata() {
        let plugin = SampleMacroPlugin()

        #expect(plugin.identifier == "SampleMacroPlugin")
        #expect(plugin.jsName == "SampleMacro")
        #expect(plugin.pluginMethods.map(\.name).sorted() == ["echo", "ping"])
    }

    @Test func mapsReturnTypes() {
        let plugin = SampleMacroPlugin()
        let byName = Dictionary(uniqueKeysWithValues: plugin.pluginMethods.map { ($0.name, $0.returnType) })

        #expect(byName["echo"] == CAPPluginReturnPromise)
        #expect(byName["ping"] == CAPPluginReturnNone)
    }

    @Test func addsCapacitorPluginConformance() {
        let plugin: Any = SampleMacroPlugin()
        #expect(plugin is CapacitorPlugin)
    }

    @Test func generatesMethodHandlers() async throws {
        let plugin = SampleMacroPlugin()
        #expect(Set(plugin.methodHandlers.keys) == ["echo", "ping"])

        var resolved: PluginCallResultData?
        let call = CAPPluginCall(callbackId: "1", methodName: "echo", options: ["value": "hi"], success: { result, _ in
            resolved = result.data
        }, error: { _ in })

        let handler = try #require(plugin.methodHandlers["echo"])
        try await handler(call)

        #expect(resolved?["value"] as? String == "hi")
    }
}
