import Foundation
import MobileCoreServices

@objc(CAPWebViewAssetHandler)
// swiftlint:disable type_body_length
open class WebViewAssetHandler: NSObject, WKURLSchemeHandler {
    private var router: Router
    private var serverUrl: URL?

    public init(router: Router) {
        self.router = router
        super.init()
    }

    open func setAssetPath(_ assetPath: String) {
        router.basePath = assetPath
    }

    open func setServerUrl(_ serverUrl: URL?) {
        self.serverUrl = serverUrl
    }

    private func isUsingLiveReload(_ localUrl: URL) -> Bool {
        return self.serverUrl != nil && self.serverUrl?.scheme != localUrl.scheme
    }

    open func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let startPath: String
        let url = urlSchemeTask.request.url!
        let stringToLoad = url.path
        let localUrl = URL.init(string: url.absoluteString)!

        if url.path.starts(with: CapacitorBridge.httpInterceptorStartIdentifier) {
            handleCapacitorHttpRequest(urlSchemeTask, localUrl, false)
            return
        }

        if stringToLoad.starts(with: CapacitorBridge.fileStartIdentifier) {
            startPath = stringToLoad.replacingOccurrences(of: CapacitorBridge.fileStartIdentifier, with: "")
        } else {
            startPath = router.route(for: stringToLoad)
        }

        let fileUrl = URL.init(fileURLWithPath: startPath)

        do {
            var data = Data()
            let mimeType = mimeTypeForExtension(pathExtension: url.pathExtension)
            var headers =  [
                "Content-Type": mimeType,
                "Cache-Control": "no-cache"
            ]

            // if using live reload, then set CORS headers
            if isUsingLiveReload(localUrl) {
                headers["Access-Control-Allow-Origin"] = self.serverUrl?.absoluteString
                headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS, TRACE"
            }

            if let rangeString = urlSchemeTask.request.value(forHTTPHeaderField: "Range"),
               let totalSize = try fileUrl.resourceValues(forKeys: [.fileSizeKey]).fileSize {
                let fileHandle = try FileHandle(forReadingFrom: fileUrl)
                let parts = rangeString.components(separatedBy: "=")
                let streamParts = parts[1].components(separatedBy: "-")
                let fromRange = Int(streamParts[0]) ?? 0
                var toRange = totalSize - 1
                if streamParts.count > 1 {
                    toRange = Int(streamParts[1]) ?? toRange
                }
                let rangeLength = toRange - fromRange + 1
                try fileHandle.seek(toOffset: UInt64(fromRange))
                data = fileHandle.readData(ofLength: rangeLength)
                headers["Accept-Ranges"] = "bytes"
                headers["Content-Range"] = "bytes \(fromRange)-\(toRange)/\(totalSize)"
                headers["Content-Length"] = String(data.count)
                let response = HTTPURLResponse(url: localUrl, statusCode: 206, httpVersion: nil, headerFields: headers)
                urlSchemeTask.didReceive(response!)
                try fileHandle.close()
            } else {
                if !stringToLoad.contains("cordova.js") {
                    if isMediaExtension(pathExtension: url.pathExtension) {
                        data = try Data(contentsOf: fileUrl, options: Data.ReadingOptions.mappedIfSafe)
                    } else {
                        data = try Data(contentsOf: fileUrl)
                    }
                }
                let urlResponse = URLResponse(url: localUrl, mimeType: mimeType, expectedContentLength: data.count, textEncodingName: nil)
                let httpResponse = HTTPURLResponse(url: localUrl, statusCode: 200, httpVersion: nil, headerFields: headers)
                if isMediaExtension(pathExtension: url.pathExtension) {
                    urlSchemeTask.didReceive(urlResponse)
                } else {
                    urlSchemeTask.didReceive(httpResponse!)
                }
            }
            urlSchemeTask.didReceive(data)
        } catch let error as NSError {
            urlSchemeTask.didFailWithError(error)
            return
        }
        urlSchemeTask.didFinish()
    }

    open func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        urlSchemeTask.stopped = true
    }

    open func mimeTypeForExtension(pathExtension: String) -> String {
        if !pathExtension.isEmpty {
            if let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, pathExtension as NSString, nil)?.takeRetainedValue() {
                if let mimetype = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() {
                    return mimetype as String
                }
            }
            // TODO: Remove in the future if Apple fixes the issue
            if let mimeType = mimeTypes[pathExtension] {
                return mimeType
            }
            return "application/octet-stream"
        }
        return "text/html"
    }

    open func isMediaExtension(pathExtension: String) -> Bool {
        let mediaExtensions = ["m4v", "mov", "mp4",
                               "aac", "ac3", "aiff", "au", "flac", "m4a", "mp3", "wav"]
        if mediaExtensions.contains(pathExtension.lowercased()) {
            return true
        }
        return false
    }

    func handleCapacitorHttpRequest(_ urlSchemeTask: WKURLSchemeTask, _ localUrl: URL, _ isHttpsRequest: Bool) {
        var urlRequest = urlSchemeTask.request
        guard let url = urlRequest.url else { return }

        let urlComponents = URLComponents(url: url, resolvingAgainstBaseURL: false)
        if let targetUrl = urlComponents?.queryItems?.first(where: { $0.name == CapacitorBridge.httpInterceptorUrlParam })?.value,
           !targetUrl.isEmpty {
            urlRequest.url = URL(string: targetUrl)
        }

        let urlSession = URLSession.shared
        let task = urlSession.dataTask(with: urlRequest) { (data, response, error) in
            DispatchQueue.main.async {
                guard !urlSchemeTask.stopped else { return }
                if let error = error {
                    urlSchemeTask.didFailWithError(error)
                    return
                }

                if let response = response as? HTTPURLResponse {
                    let existingHeaders = response.allHeaderFields
                    var newHeaders: [AnyHashable: Any] = [:]

                    // if using live reload, then set CORS headers
                    if self.isUsingLiveReload(url) {
                        newHeaders = [
                            "Access-Control-Allow-Origin": self.serverUrl?.absoluteString ?? "",
                            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, TRACE"
                        ]
                    }

                    if let mergedHeaders = existingHeaders.merging(newHeaders, uniquingKeysWith: { (_, newHeaders) in newHeaders }) as? [String: String] {

                        if let responseUrl = response.url {
                            if let modifiedResponse = HTTPURLResponse(
                                url: responseUrl,
                                statusCode: response.statusCode,
                                httpVersion: nil,
                                headerFields: mergedHeaders
                            ) {
                                urlSchemeTask.didReceive(modifiedResponse)
                            }
                        }

                        if let data = data {
                            urlSchemeTask.didReceive(data)
                        }
                    }
                }
                urlSchemeTask.didFinish()
                return
            }
        }

        task.resume()
    }

    public let mimeTypes = [
        "aaf": "application/octet-stream",
        "aca": "application/octet-stream",
        "accdb": "application/msaccess",
        "accde": "application/msaccess",
        "accdt": "application/msaccess",
        "acx": "application/internet-property-stream",
        "afm": "application/octet-stream",
        "ai": "application/postscript",
        "aif": "audio/x-aiff",
        "aifc": "audio/aiff",
        "aiff": "audio/aiff",
        "application": "application/x-ms-application",
        "art": "image/x-jg",
        "asd": "application/octet-stream",
        "asf": "video/x-ms-asf",
        "asi": "application/octet-stream",
        "asm": "text/plain",
        "asr": "video/x-ms-asf",
        "asx": "video/x-ms-asf",
        "atom": "application/atom+xml",
        "au": "audio/basic",
        "avi": "video/x-msvideo",
        "axs": "application/olescript",
        "bas": "text/plain",
        "bcpio": "application/x-bcpio",
        "bin": "application/octet-stream",
        "bmp": "image/bmp",
        "c": "text/plain",
        "cab": "application/octet-stream",
        "calx": "application/vnd.ms-office.calx",
        "cat": "application/vnd.ms-pki.seccat",
        "cdf": "application/x-cdf",
        "chm": "application/octet-stream",
        "class": "application/x-java-applet",
        "clp": "application/x-msclip",
        "cmx": "image/x-cmx",
        "cnf": "text/plain",
        "cod": "image/cis-cod",
        "cpio": "application/x-cpio",
        "cpp": "text/plain",
        "crd": "application/x-mscardfile",
        "crl": "application/pkix-crl",
        "crt": "application/x-x509-ca-cert",
        "csh": "application/x-csh",
        "css": "text/css",
        "csv": "application/octet-stream",
        "cur": "application/octet-stream",
        "dcr": "application/x-director",
        "deploy": "application/octet-stream",
        "der": "application/x-x509-ca-cert",
        "dib": "image/bmp",
        "dir": "application/x-director",
        "disco": "text/xml",
        "dll": "application/x-msdownload",
        "dll.config": "text/xml",
        "dlm": "text/dlm",
        "doc": "application/msword",
        "docm": "application/vnd.ms-word.document.macroEnabled.12",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "dot": "application/msword",
        "dotm": "application/vnd.ms-word.template.macroEnabled.12",
        "dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
        "dsp": "application/octet-stream",
        "dtd": "text/xml",
        "dvi": "application/x-dvi",
        "dwf": "drawing/x-dwf",
        "dwp": "application/octet-stream",
        "dxr": "application/x-director",
        "eml": "message/rfc822",
        "emz": "application/octet-stream",
        "eot": "application/octet-stream",
        "eps": "application/postscript",
        "etx": "text/x-setext",
        "evy": "application/envoy",
        "exe": "application/octet-stream",
        "exe.config": "text/xml",
        "fdf": "application/vnd.fdf",
        "fif": "application/fractals",
        "fla": "application/octet-stream",
        "flr": "x-world/x-vrml",
        "flv": "video/x-flv",
        "gif": "image/gif",
        "gtar": "application/x-gtar",
        "gz": "application/x-gzip",
        "h": "text/plain",
        "hdf": "application/x-hdf",
        "hdml": "text/x-hdml",
        "hhc": "application/x-oleobject",
        "hhk": "application/octet-stream",
        "hhp": "application/octet-stream",
        "hlp": "application/winhlp",
        "hqx": "application/mac-binhex40",
        "hta": "application/hta",
        "htc": "text/x-component",
        "htm": "text/html",
        "html": "text/html",
        "htt": "text/webviewhtml",
        "hxt": "text/html",
        "ico": "image/x-icon",
        "ics": "application/octet-stream",
        "ief": "image/ief",
        "iii": "application/x-iphone",
        "inf": "application/octet-stream",
        "ins": "application/x-internet-signup",
        "isp": "application/x-internet-signup",
        "IVF": "video/x-ivf",
        "jar": "application/java-archive",
        "java": "application/octet-stream",
        "jck": "application/liquidmotion",
        "jcz": "application/liquidmotion",
        "jfif": "image/pjpeg",
        "jpb": "application/octet-stream",
        "jpe": "image/jpeg",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "application/x-javascript",
        "jsx": "text/jscript",
        "latex": "application/x-latex",
        "lit": "application/x-ms-reader",
        "lpk": "application/octet-stream",
        "lsf": "video/x-la-asf",
        "lsx": "video/x-la-asf",
        "lzh": "application/octet-stream",
        "m13": "application/x-msmediaview",
        "m14": "application/x-msmediaview",
        "m1v": "video/mpeg",
        "m3u": "audio/x-mpegurl",
        "man": "application/x-troff-man",
        "manifest": "application/x-ms-manifest",
        "map": "text/plain",
        "mdb": "application/x-msaccess",
        "mdp": "application/octet-stream",
        "me": "application/x-troff-me",
        "mht": "message/rfc822",
        "mhtml": "message/rfc822",
        "mid": "audio/mid",
        "midi": "audio/mid",
        "mix": "application/octet-stream",
        "mmf": "application/x-smaf",
        "mno": "text/xml",
        "mny": "application/x-msmoney",
        "mov": "video/quicktime",
        "movie": "video/x-sgi-movie",
        "mp2": "video/mpeg",
        "mp3": "audio/mpeg",
        "mpa": "video/mpeg",
        "mpe": "video/mpeg",
        "mpeg": "video/mpeg",
        "mpg": "video/mpeg",
        "mpp": "application/vnd.ms-project",
        "mpv2": "video/mpeg",
        "ms": "application/x-troff-ms",
        "msi": "application/octet-stream",
        "mso": "application/octet-stream",
        "mvb": "application/x-msmediaview",
        "mvc": "application/x-miva-compiled",
        "nc": "application/x-netcdf",
        "nsc": "video/x-ms-asf",
        "nws": "message/rfc822",
        "ocx": "application/octet-stream",
        "oda": "application/oda",
        "odc": "text/x-ms-odc",
        "ods": "application/oleobject",
        "one": "application/onenote",
        "onea": "application/onenote",
        "onetoc": "application/onenote",
        "onetoc2": "application/onenote",
        "onetmp": "application/onenote",
        "onepkg": "application/onenote",
        "osdx": "application/opensearchdescription+xml",
        "p10": "application/pkcs10",
        "p12": "application/x-pkcs12",
        "p7b": "application/x-pkcs7-certificates",
        "p7c": "application/pkcs7-mime",
        "p7m": "application/pkcs7-mime",
        "p7r": "application/x-pkcs7-certreqresp",
        "p7s": "application/pkcs7-signature",
        "pbm": "image/x-portable-bitmap",
        "pcx": "application/octet-stream",
        "pcz": "application/octet-stream",
        "pdf": "application/pdf",
        "pfb": "application/octet-stream",
        "pfm": "application/octet-stream",
        "pfx": "application/x-pkcs12",
        "pgm": "image/x-portable-graymap",
        "pko": "application/vnd.ms-pki.pko",
        "pma": "application/x-perfmon",
        "pmc": "application/x-perfmon",
        "pml": "application/x-perfmon",
        "pmr": "application/x-perfmon",
        "pmw": "application/x-perfmon",
        "png": "image/png",
        "pnm": "image/x-portable-anymap",
        "pnz": "image/png",
        "pot": "application/vnd.ms-powerpoint",
        "potm": "application/vnd.ms-powerpoint.template.macroEnabled.12",
        "potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
        "ppam": "application/vnd.ms-powerpoint.addin.macroEnabled.12",
        "ppm": "image/x-portable-pixmap",
        "pps": "application/vnd.ms-powerpoint",
        "ppsm": "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
        "ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
        "ppt": "application/vnd.ms-powerpoint",
        "pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "prf": "application/pics-rules",
        "prm": "application/octet-stream",
        "prx": "application/octet-stream",
        "ps": "application/postscript",
        "psd": "application/octet-stream",
        "psm": "application/octet-stream",
        "psp": "application/octet-stream",
        "pub": "application/x-mspublisher",
        "qt": "video/quicktime",
        "qtl": "application/x-quicktimeplayer",
        "qxd": "application/octet-stream",
        "ra": "audio/x-pn-realaudio",
        "ram": "audio/x-pn-realaudio",
        "rar": "application/octet-stream",
        "ras": "image/x-cmu-raster",
        "rf": "image/vnd.rn-realflash",
        "rgb": "image/x-rgb",
        "rm": "application/vnd.rn-realmedia",
        "rmi": "audio/mid",
        "roff": "application/x-troff",
        "rpm": "audio/x-pn-realaudio-plugin",
        "rtf": "application/rtf",
        "rtx": "text/richtext",
        "scd": "application/x-msschedule",
        "sct": "text/scriptlet",
        "sea": "application/octet-stream",
        "setpay": "application/set-payment-initiation",
        "setreg": "application/set-registration-initiation",
        "sgml": "text/sgml",
        "sh": "application/x-sh",
        "shar": "application/x-shar",
        "sit": "application/x-stuffit",
        "sldm": "application/vnd.ms-powerpoint.slide.macroEnabled.12",
        "sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
        "smd": "audio/x-smd",
        "smi": "application/octet-stream",
        "smx": "audio/x-smd",
        "smz": "audio/x-smd",
        "snd": "audio/basic",
        "snp": "application/octet-stream",
        "spc": "application/x-pkcs7-certificates",
        "spl": "application/futuresplash",
        "src": "application/x-wais-source",
        "ssm": "application/streamingmedia",
        "sst": "application/vnd.ms-pki.certstore",
        "stl": "application/vnd.ms-pki.stl",
        "sv4cpio": "application/x-sv4cpio",
        "sv4crc": "application/x-sv4crc",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "t": "application/x-troff",
        "tar": "application/x-tar",
        "tcl": "application/x-tcl",
        "tex": "application/x-tex",
        "texi": "application/x-texinfo",
        "texinfo": "application/x-texinfo",
        "tgz": "application/x-compressed",
        "thmx": "application/vnd.ms-officetheme",
        "thn": "application/octet-stream",
        "tif": "image/tiff",
        "tiff": "image/tiff",
        "toc": "application/octet-stream",
        "tr": "application/x-troff",
        "trm": "application/x-msterminal",
        "tsv": "text/tab-separated-values",
        "ttf": "application/octet-stream",
        "txt": "text/plain",
        "u32": "application/octet-stream",
        "uls": "text/iuls",
        "ustar": "application/x-ustar",
        "vbs": "text/vbscript",
        "vcf": "text/x-vcard",
        "vcs": "text/plain",
        "vdx": "application/vnd.ms-visio.viewer",
        "vml": "text/xml",
        "vsd": "application/vnd.visio",
        "vss": "application/vnd.visio",
        "vst": "application/vnd.visio",
        "vsto": "application/x-ms-vsto",
        "vsw": "application/vnd.visio",
        "vsx": "application/vnd.visio",
        "vtx": "application/vnd.visio",
        "wasm": "application/wasm",
        "wav": "audio/wav",
        "wax": "audio/x-ms-wax",
        "wbmp": "image/vnd.wap.wbmp",
        "wcm": "application/vnd.ms-works",
        "wdb": "application/vnd.ms-works",
        "wks": "application/vnd.ms-works",
        "wm": "video/x-ms-wm",
        "wma": "audio/x-ms-wma",
        "wmd": "application/x-ms-wmd",
        "wmf": "application/x-msmetafile",
        "wml": "text/vnd.wap.wml",
        "wmlc": "application/vnd.wap.wmlc",
        "wmls": "text/vnd.wap.wmlscript",
        "wmlsc": "application/vnd.wap.wmlscriptc",
        "wmp": "video/x-ms-wmp",
        "wmv": "video/x-ms-wmv",
        "wmx": "video/x-ms-wmx",
        "wmz": "application/x-ms-wmz",
        "wps": "application/vnd.ms-works",
        "wri": "application/x-mswrite",
        "wrl": "x-world/x-vrml",
        "wrz": "x-world/x-vrml",
        "wsdl": "text/xml",
        "wvx": "video/x-ms-wvx",
        "x": "application/directx",
        "xaf": "x-world/x-vrml",
        "xaml": "application/xaml+xml",
        "xap": "application/x-silverlight-app",
        "xbap": "application/x-ms-xbap",
        "xbm": "image/x-xbitmap",
        "xdr": "text/plain",
        "xht": "application/xhtml+xml",
        "xhtml": "application/xhtml+xml",
        "xla": "application/vnd.ms-excel",
        "xlam": "application/vnd.ms-excel.addin.macroEnabled.12",
        "xlc": "application/vnd.ms-excel",
        "xlm": "application/vnd.ms-excel",
        "xls": "application/vnd.ms-excel",
        "xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
        "xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "xlt": "application/vnd.ms-excel",
        "xltm": "application/vnd.ms-excel.template.macroEnabled.12",
        "xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
        "xlw": "application/vnd.ms-excel",
        "xml": "text/xml",
        "xof": "x-world/x-vrml",
        "xpm": "image/x-xpixmap",
        "xps": "application/vnd.ms-xpsdocument",
        "xsd": "text/xml",
        "xsf": "text/xml",
        "xsl": "text/xml",
        "xslt": "text/xml",
        "xsn": "application/octet-stream",
        "xtp": "application/octet-stream",
        "xwd": "image/x-xwindowdump",
        "z": "application/x-compress",
        "zip": "application/x-zip-compressed"
    ]
}

private var stoppedKey = malloc(1)

private extension WKURLSchemeTask {
    var stopped: Bool {
        get {
            return objc_getAssociatedObject(self, &stoppedKey) as? Bool ?? false
        }
        set {
            objc_setAssociatedObject(self, &stoppedKey, newValue, .OBJC_ASSOCIATION_ASSIGN)
        }
    }
}
