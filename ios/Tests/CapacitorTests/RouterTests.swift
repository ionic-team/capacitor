import Testing
@testable import Capacitor

struct RouterTests {
    @Test func routerReturnsIndexWhenProvidedEmptyPath() {
        checkRouter(path: "", expected: "/index.html")
    }

    @Test func routerReturnsIndexWhenProvidedPathWithoutExtension() {
        checkRouter(path: "/a/valid/path/no/ext", expected: "/index.html")
    }

    @Test func routerReturnsPathWhenProvidedValidPath() {
        checkRouter(path: "/a/valid/path.ext", expected: "/a/valid/path.ext")
    }

    @Test func routerReturnsPathWhenProvidedValidPathWithExtensionAndSpaces() {
        checkRouter(path: "/a/valid/file path.ext", expected: "/a/valid/file path.ext")
    }

    private func checkRouter(path: String, expected: String) {
        var router = CapacitorRouter()
        #expect(router.route(for: path) == expected)
        router.basePath = "/A/Route"
        #expect(router.route(for: path) == "/A/Route" + expected)
    }
}
