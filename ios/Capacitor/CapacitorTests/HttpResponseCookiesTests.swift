import XCTest

@testable import Capacitor

class HttpResponseCookiesTests: XCTestCase {
    private let url = URL(string: "https://app.example.com/path")!

    private func response(setCookie: String) -> HTTPURLResponse {
        return HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: ["Set-Cookie": setCookie])!
    }

    func testKeepsCookiesOfTheResponseHostAndItsParentDomain() {
        let cookies = HttpRequestHandler.responseCookies(response(setCookie: "host=1; Path=/, parent=1; Path=/; Domain=example.com"))

        XCTAssertEqual(cookies.map { $0.name }.sorted(), ["host", "parent"])
    }

    func testDropsCookiesOfForeignAndSiblingDomains() {
        let cookies = HttpRequestHandler.responseCookies(
            response(setCookie: "host=1; Path=/, foreign=1; Path=/; Domain=other.example, sibling=1; Path=/; Domain=www.example.com")
        )

        XCTAssertEqual(cookies.map { $0.name }, ["host"])
    }

    func testParsesExpiresDatesWithCommas() {
        let cookies = HttpRequestHandler.responseCookies(
            response(setCookie: "first=1; Expires=Wed, 21 Oct 2037 07:28:00 GMT; Path=/, second=2; Path=/")
        )

        XCTAssertEqual(cookies.map { $0.name }.sorted(), ["first", "second"])
        XCTAssertNotNil(cookies.first { $0.name == "first" }?.expiresDate)
    }

    func testReturnsExpiredCookiesSoTheyCanBeDeleted() {
        let cookies = HttpRequestHandler.responseCookies(response(setCookie: "gone=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/"))

        XCTAssertEqual(cookies.map { $0.name }, ["gone"])
        XCTAssertLessThan(cookies.first?.expiresDate ?? .distantFuture, Date())
    }

    func testRedirectCookiesAreCollectedAndTheRedirectIsFollowed() {
        let redirectCookies = CapacitorRedirectCookies()
        let redirect = HTTPURLResponse(url: url, statusCode: 302, httpVersion: nil, headerFields: ["Set-Cookie": "session=new; Path=/"])!
        let next = URLRequest(url: URL(string: "https://app.example.com/next")!)
        var followed: URLRequest?

        redirectCookies.urlSession(URLSession.shared, task: URLSession.shared.dataTask(with: url), willPerformHTTPRedirection: redirect, newRequest: next) {
            followed = $0
        }

        XCTAssertEqual(redirectCookies.cookies.map { $0.name }, ["session"])
        XCTAssertEqual(followed, next)
    }
}
