import Foundation

final class JSONSerializationWrapper {
    let dictionary: [AnyHashable: Any]

    init?(dictionary: [AnyHashable: Any]) {
        self.dictionary = dictionary
    }

    func unwrappedResult() -> [AnyHashable: Any]? {
        guard let serializedData = try? JSONSerialization.data(withJSONObject: dictionary, options: [.prettyPrinted]) else {
            return nil
        }
        return try? JSONSerialization.jsonObject(with: serializedData, options: []) as? [AnyHashable: Any]
    }
}
