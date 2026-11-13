import Foundation
import Testing
@testable import Capacitor

struct PluginCallResultTests {
    private static func dictionary(from result: PluginCallResult?) -> PluginCallResultData? {
        guard let result = result else {
            return nil
        }
        switch result {
        case .dictionary(let data):
            return data
        }
    }

    @Test func resultDataCarriesTheResultPayload() {
        let result = CAPPluginCallResult(["value": "hello"])

        #expect(Self.dictionary(from: result.resultData)?["value"] as? String == "hello")
    }

    @Test func resultDataIsNilWithoutAPayload() {
        let result = CAPPluginCallResult(nil)

        #expect(result.resultData == nil)
    }

    @Test func errorResultDataCarriesTheWrappedPayload() {
        let error = CAPPluginCallError(message: "failed", code: "FAILED", error: nil, data: ["value": "hello"])
        let wrapped = Self.dictionary(from: error.resultData)?["data"] as? PluginCallResultData

        #expect(wrapped?["value"] as? String == "hello")
    }

    @Test func errorResultDataIsNilWithoutAPayload() {
        let error = CAPPluginCallError(message: "failed", code: "FAILED", error: nil, data: nil)

        #expect(error.resultData == nil)
    }
}
