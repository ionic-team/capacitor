import SwiftSyntax
import SwiftSyntaxMacros

/// Marker macro. It produces no code of its own; ``PluginMacro`` reads the annotation and its
/// `returnType` argument to synthesize the plugin's method metadata and handler map.
public struct PluginMethodMacro: PeerMacro {
    public static func expansion(
        of node: AttributeSyntax,
        providingPeersOf declaration: some DeclSyntaxProtocol,
        in context: some MacroExpansionContext
    ) throws -> [DeclSyntax] {
        guard let function = declaration.as(FunctionDeclSyntax.self) else {
            throw MacroError.message("@PluginMethod can only be applied to a function")
        }

        let parameters = function.signature.parameterClause.parameters
        guard parameters.count == 1 else {
            throw MacroError.message("@PluginMethod functions must take a single CAPPluginCall argument")
        }

        return []
    }
}
