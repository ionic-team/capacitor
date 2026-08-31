import SwiftCompilerPlugin
import SwiftSyntaxMacros

@main
struct CapacitorMacrosPlugin: CompilerPlugin {
    let providingMacros: [Macro.Type] = [
        PluginMacro.self,
        PluginMethodMacro.self
    ]
}

enum MacroError: Error, CustomStringConvertible {
    case message(String)

    var description: String {
        switch self {
        case .message(let message):
            return message
        }
    }
}
