import SwiftSyntax
import SwiftSyntaxBuilder
import SwiftSyntaxMacros

/// Implements `@Plugin(jsName:identifier:)`.
///
/// Generates the `CAPBridgedPlugin` metadata (`identifier`, `jsName`, `pluginMethods`) and the
/// `CapacitorPlugin` `methodHandlers` map from the methods annotated with `@PluginMethod`, and
/// adds the `CapacitorPlugin` conformance.
public struct PluginMacro: MemberMacro, ExtensionMacro {

    // MARK: - MemberMacro

    public static func expansion(
        of node: AttributeSyntax,
        providingMembersOf declaration: some DeclGroupSyntax,
        in context: some MacroExpansionContext
    ) throws -> [DeclSyntax] {
        guard let classDecl = declaration.as(ClassDeclSyntax.self) else {
            throw MacroError.message("@Plugin can only be applied to a class")
        }
        let className = classDecl.name.text

        guard case let .argumentList(arguments) = node.arguments else {
            throw MacroError.message("@Plugin requires a jsName argument")
        }
        guard let jsNameExpr = arguments.first(where: { $0.label?.text == "jsName" })?.expression else {
            throw MacroError.message("@Plugin requires a jsName argument")
        }
        let identifierExpr = arguments.first(where: { $0.label?.text == "identifier" })?.expression
        let identifierLiteral = identifierExpr.map { "\($0)" } ?? "\"\(className)\""

        let methods = try collectMethods(in: classDecl)

        let pluginMethodElements = methods
            .map { "CAPPluginMethod(name: \"\($0.name)\", returnType: \($0.returnConstant))" }
            .joined(separator: ",\n        ")

        let handlerEntries = methods
            .map { "\"\($0.name)\": { \($0.callExpression) }" }
            .joined(separator: ",\n            ")
        let handlersLiteral = methods.isEmpty ? "[:]" : "[\n            \(handlerEntries)\n        ]"

        return [
            "public let identifier = \(raw: identifierLiteral)",
            "public let jsName = \(jsNameExpr)",
            """
            public let pluginMethods: [CAPPluginMethod] = [
                \(raw: pluginMethodElements)
            ]
            """,
            """
            public var methodHandlers: [String: (CAPPluginCall) async throws -> Void] {
                \(raw: handlersLiteral)
            }
            """
        ]
    }

    // MARK: - ExtensionMacro

    public static func expansion(
        of node: AttributeSyntax,
        attachedTo declaration: some DeclGroupSyntax,
        providingExtensionsOf type: some TypeSyntaxProtocol,
        conformingTo protocols: [TypeSyntax],
        in context: some MacroExpansionContext
    ) throws -> [ExtensionDeclSyntax] {
        let conformance = try ExtensionDeclSyntax("extension \(type.trimmed): CapacitorPlugin {}")
        return [conformance]
    }

    // MARK: - Helpers

    private struct PluginMethodInfo {
        let name: String
        let returnConstant: String
        let callExpression: String
    }

    private static func collectMethods(in classDecl: ClassDeclSyntax) throws -> [PluginMethodInfo] {
        var methods: [PluginMethodInfo] = []
        for member in classDecl.memberBlock.members {
            guard let function = member.decl.as(FunctionDeclSyntax.self),
                  let attribute = function.pluginMethodAttribute else {
                continue
            }

            let name = function.name.text
            let effects = function.signature.effectSpecifiers
            var call = "self.\(name)($0)"
            if effects?.asyncSpecifier != nil {
                call = "await " + call
            }
            if effects?.throwsClause != nil {
                call = "try " + call
            }

            methods.append(
                PluginMethodInfo(
                    name: name,
                    returnConstant: attribute.pluginMethodReturnConstant,
                    callExpression: call
                )
            )
        }
        return methods
    }
}

private extension FunctionDeclSyntax {
    var pluginMethodAttribute: AttributeSyntax? {
        for element in attributes {
            guard case let .attribute(attribute) = element,
                  attribute.attributeName.as(IdentifierTypeSyntax.self)?.name.text == "PluginMethod" else {
                continue
            }
            return attribute
        }
        return nil
    }
}

private extension AttributeSyntax {
    var pluginMethodReturnConstant: String {
        guard case let .argumentList(arguments) = arguments,
              let expression = arguments.first(where: { $0.label?.text == "returnType" })?.expression,
              let member = expression.as(MemberAccessExprSyntax.self) else {
            return "CAPPluginReturnPromise"
        }
        switch member.declName.baseName.text {
        case "callback":
            return "CAPPluginReturnCallback"
        case "none":
            return "CAPPluginReturnNone"
        default:
            return "CAPPluginReturnPromise"
        }
    }
}
