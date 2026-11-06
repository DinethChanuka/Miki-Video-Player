import Cocoa
import WebKit
import UniformTypeIdentifiers
import Network

class BorderlessKeyWindow: NSWindow {
    override var canBecomeKey: Bool {
        return true
    }
    override var canBecomeMain: Bool {
        return true
    }
    var lastMouseDownEvent: NSEvent?

    override func sendEvent(_ event: NSEvent) {
        if event.type == .leftMouseDown {
            lastMouseDownEvent = event
        }
        super.sendEvent(event)
    }
}

class MediaStreamSchemeHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(NSError(domain: "MediaStream", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"]))
            return
        }

        var filePath = ""
        if let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
           let pathItem = components.queryItems?.first(where: { $0.name == "path" })?.value {
            filePath = pathItem
        } else {
            filePath = url.path
        }

        filePath = (filePath as NSString).standardizingPath
        if filePath.hasPrefix("file://") {
            filePath = String(filePath.dropFirst(7))
        }

        guard FileManager.default.fileExists(atPath: filePath) else {
            urlSchemeTask.didFailWithError(NSError(domain: "MediaStream", code: 404, userInfo: [NSLocalizedDescriptionKey: "File not found"]))
            return
        }

        guard let attributes = try? FileManager.default.attributesOfItem(atPath: filePath),
              let fileSize = attributes[.size] as? Int64 else {
            urlSchemeTask.didFailWithError(NSError(domain: "MediaStream", code: 500, userInfo: [NSLocalizedDescriptionKey: "Cannot read attributes"]))
            return
        }

        let ext = (filePath as NSString).pathExtension.lowercased()
        let mimeMap: [String: String] = [
            "mp4": "video/mp4",
            "m4v": "video/mp4",
            "webm": "video/webm",
            "mkv": "video/x-matroska",
            "mov": "video/quicktime",
            "avi": "video/x-msvideo",
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "flac": "audio/flac",
            "m4a": "audio/mp4",
            "aac": "audio/aac",
            "ogg": "audio/ogg",
            "ts": "video/mp2t",
            "m3u8": "application/vnd.apple.mpegurl",
            "m3u": "audio/x-mpegurl"
        ]
        let mimeType = mimeMap[ext] ?? "video/mp4"

        guard let fileHandle = FileHandle(forReadingAtPath: filePath) else {
            urlSchemeTask.didFailWithError(NSError(domain: "MediaStream", code: 500, userInfo: [NSLocalizedDescriptionKey: "Cannot open file handle"]))
            return
        }

        let rangeHeader = urlSchemeTask.request.value(forHTTPHeaderField: "Range")
        if let range = rangeHeader, range.starts(with: "bytes=") {
            let cleanRange = String(range.dropFirst(6))
            let parts = cleanRange.components(separatedBy: "-")
            var start: Int64 = 0
            var end: Int64 = fileSize - 1

            if let p0 = Int64(parts[0]) {
                start = p0
            }
            if parts.count > 1, let p1 = Int64(parts[1]) {
                end = p1
            }

            if start >= fileSize || start > end {
                let headers: [String: String] = [
                    "Content-Range": "bytes */\(fileSize)",
                    "Accept-Ranges": "bytes"
                ]
                let response = HTTPURLResponse(url: url, statusCode: 416, httpVersion: "HTTP/1.1", headerFields: headers)!
                urlSchemeTask.didReceive(response)
                urlSchemeTask.didFinish()
                try? fileHandle.close()
                return
            }

            let length = end - start + 1
            let headers: [String: String] = [
                "Content-Type": mimeType,
                "Content-Range": "bytes \(start)-\(end)/\(fileSize)",
                "Content-Length": "\(length)",
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*"
            ]

            let response = HTTPURLResponse(url: url, statusCode: 206, httpVersion: "HTTP/1.1", headerFields: headers)!
            urlSchemeTask.didReceive(response)

            fileHandle.seek(toFileOffset: UInt64(start))
            let data = fileHandle.readData(ofLength: Int(length))
            urlSchemeTask.didReceive(data)
            urlSchemeTask.didFinish()
            try? fileHandle.close()
        } else {
            let headers: [String: String] = [
                "Content-Type": mimeType,
                "Content-Length": "\(fileSize)",
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*"
            ]
            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers)!
            urlSchemeTask.didReceive(response)

            let chunkSize = 1024 * 1024
            while true {
                let chunk = fileHandle.readData(ofLength: chunkSize)
                if chunk.isEmpty { break }
                urlSchemeTask.didReceive(chunk)
            }
            urlSchemeTask.didFinish()
            try? fileHandle.close()
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}

class AppAssetSchemeHandler: NSObject, WKURLSchemeHandler {
    static func getDistUrl() -> URL? {
        if let bundleDist = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist") {
            return bundleDist.deletingLastPathComponent()
        }
        if let resUrl = Bundle.main.resourceURL?.appendingPathComponent("dist"),
           FileManager.default.fileExists(atPath: resUrl.path) {
            return resUrl
        }
        let devDist = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("dist")
        if FileManager.default.fileExists(atPath: devDist.path) {
            return devDist
        }
        return nil
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(NSError(domain: "AppScheme", code: 400, userInfo: nil))
            return
        }

        var path = url.path
        if path.isEmpty || path == "/" {
            path = "/index.html"
        }

        let cleanRelPath = path.hasPrefix("/") ? String(path.dropFirst()) : path

        guard let distUrl = AppAssetSchemeHandler.getDistUrl() else {
            urlSchemeTask.didFailWithError(NSError(domain: "AppScheme", code: 404, userInfo: [NSLocalizedDescriptionKey: "Dist directory not found"]))
            return
        }

        let fileUrl = distUrl.appendingPathComponent(cleanRelPath)

        guard FileManager.default.fileExists(atPath: fileUrl.path),
              let data = try? Data(contentsOf: fileUrl) else {
            NSLog("[Miki AppScheme] Resource not found: %@", cleanRelPath)
            let res = HTTPURLResponse(url: url, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!
            urlSchemeTask.didReceive(res)
            urlSchemeTask.didFinish()
            return
        }

        var mimeType = "application/octet-stream"
        let ext = fileUrl.pathExtension.lowercased()
        if ext == "html" { mimeType = "text/html; charset=utf-8" }
        else if ext == "js" || ext == "mjs" { mimeType = "text/javascript; charset=utf-8" }
        else if ext == "css" { mimeType = "text/css; charset=utf-8" }
        else if ext == "png" { mimeType = "image/png" }
        else if ext == "jpg" || ext == "jpeg" { mimeType = "image/jpeg" }
        else if ext == "svg" { mimeType = "image/svg+xml" }
        else if ext == "json" { mimeType = "application/json" }
        else if ext == "woff2" { mimeType = "font/woff2" }
        else if ext == "woff" { mimeType = "font/woff" }
        else if ext == "ttf" { mimeType = "font/ttf" }
        else if ext == "ico" { mimeType = "image/x-icon" }
        else if ext == "mp4" { mimeType = "video/mp4" }

        let rangeHeader = urlSchemeTask.request.value(forHTTPHeaderField: "Range")
        if let range = rangeHeader, range.starts(with: "bytes=") {
            let fileSize = Int64(data.count)
            let cleanRange = String(range.dropFirst(6))
            let parts = cleanRange.components(separatedBy: "-")
            var start: Int64 = 0
            var end: Int64 = fileSize - 1

            if let p0 = Int64(parts[0]) {
                start = p0
            }
            if parts.count > 1, let p1 = Int64(parts[1]) {
                end = p1
            }

            if start >= fileSize || start > end {
                let headers: [String: String] = [
                    "Content-Range": "bytes */\(fileSize)",
                    "Accept-Ranges": "bytes"
                ]
                let response = HTTPURLResponse(url: url, statusCode: 416, httpVersion: "HTTP/1.1", headerFields: headers)!
                urlSchemeTask.didReceive(response)
                urlSchemeTask.didFinish()
                return
            }

            let length = end - start + 1
            let headers: [String: String] = [
                "Content-Type": mimeType,
                "Content-Range": "bytes \(start)-\(end)/\(fileSize)",
                "Content-Length": "\(length)",
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            ]

            let response = HTTPURLResponse(url: url, statusCode: 206, httpVersion: "HTTP/1.1", headerFields: headers)!
            urlSchemeTask.didReceive(response)
            let subData = data.subdata(in: Int(start)..<Int(end + 1))
            urlSchemeTask.didReceive(subData)
            urlSchemeTask.didFinish()
        } else {
            let headers: [String: String] = [
                "Content-Type": mimeType,
                "Content-Length": "\(data.count)",
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            ]

            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers)!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(data)
            urlSchemeTask.didFinish()
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}

class StreamProxySession: NSObject, URLSessionDataDelegate {
    let id = UUID()
    let connection: NWConnection
    var onFinish: (() -> Void)?
    var session: URLSession?

    init(connection: NWConnection) {
        self.connection = connection
    }

    static func == (lhs: StreamProxySession, rhs: StreamProxySession) -> Bool {
        lhs.id == rhs.id
    }

    override var hash: Int {
        id.hashValue
    }

    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive response: URLResponse, completionHandler: @escaping (URLSession.ResponseDisposition) -> Void) {
        guard let httpResp = response as? HTTPURLResponse else {
            completionHandler(.cancel)
            return
        }
        var header = "HTTP/1.1 \(httpResp.statusCode) \(httpResp.statusCode == 206 ? "Partial Content" : "OK")\r\n"
        header += "Content-Type: \(httpResp.value(forHTTPHeaderField: "Content-Type") ?? "audio/mp4")\r\n"
        if let cl = httpResp.value(forHTTPHeaderField: "Content-Length") {
            header += "Content-Length: \(cl)\r\n"
        }
        if let cr = httpResp.value(forHTTPHeaderField: "Content-Range") {
            header += "Content-Range: \(cr)\r\n"
        }
        header += "Accept-Ranges: bytes\r\n"
        header += "Access-Control-Allow-Origin: *\r\n"
        header += "Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges\r\n"
        header += "Cache-Control: no-store\r\n"
        header += "Connection: close\r\n\r\n"
        
        if let headerData = header.data(using: .utf8) {
            connection.send(content: headerData, completion: .contentProcessed({ _ in }))
        }
        completionHandler(.allow)
    }

    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
        connection.send(content: data, completion: .contentProcessed({ _ in }))
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        connection.send(content: nil, contentContext: .finalMessage, isComplete: true, completion: .contentProcessed({ [weak self] _ in
            self?.connection.cancel()
            self?.onFinish?()
        }))
    }
}

class LocalAppServer {
    private var listener: NWListener?
    let baseDir: URL
    let port: UInt16 = 39281
    private var streamCache: [String: (url: String, expires: Date)] = [:]
    private let cacheLock = NSLock()
    private var activeProxySessions = Set<StreamProxySession>()
    private let proxySessionsLock = NSLock()

    init(baseDir: URL) {
        self.baseDir = baseDir
    }

    private func resolveAudioStream(videoId: String, completion: @escaping (String?) -> Void) {
        cacheLock.lock()
        if let cached = streamCache[videoId], cached.expires > Date() {
            let url = cached.url
            cacheLock.unlock()
            completion(url)
            return
        }
        cacheLock.unlock()

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { completion(nil); return }
            
            var ytDlpPath = "./bin/yt-dlp"
            if let resBin = Bundle.main.resourcePath.map({ "\($0)/bin/yt-dlp" }), FileManager.default.fileExists(atPath: resBin) {
                ytDlpPath = resBin
            } else if FileManager.default.fileExists(atPath: "./bin/yt-dlp") {
                ytDlpPath = "./bin/yt-dlp"
            } else if FileManager.default.fileExists(atPath: "/usr/local/bin/yt-dlp") {
                ytDlpPath = "/usr/local/bin/yt-dlp"
            }
            
            let proc = Process()
            proc.executableURL = URL(fileURLWithPath: ytDlpPath)
            proc.arguments = [
                "--force-ipv4",
                "--no-check-certificates",
                "--geo-bypass",
                "--extractor-args", "youtube:skip=hls,dash,translated_subs",
                "-f", "bestaudio[ext=m4a]/bestaudio[ext=mp4]/bestaudio",
                "--no-warnings",
                "--no-playlist",
                "-g",
                "https://www.youtube.com/watch?v=\(videoId)"
            ]
            let pipe = Pipe()
            proc.standardOutput = pipe
            proc.standardError = Pipe()
            
            do {
                try proc.run()
                proc.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                if let outStr = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines),
                   !outStr.isEmpty && outStr.hasPrefix("http") {
                    let firstUrl = outStr.components(separatedBy: "\n").first?.trimmingCharacters(in: .whitespacesAndNewlines) ?? outStr
                    self.cacheLock.lock()
                    self.streamCache[videoId] = (url: firstUrl, expires: Date().addingTimeInterval(14400))
                    self.cacheLock.unlock()
                    completion(firstUrl)
                    return
                }
            } catch {
                NSLog("[Miki Server] yt-dlp execution error: %@", error.localizedDescription)
            }
            completion(nil)
        }
    }

    func start() {
        do {
            let params = NWParameters.tcp
            self.listener = try NWListener(using: params, on: NWEndpoint.Port(rawValue: port)!)
            self.listener?.newConnectionHandler = { [weak self] connection in
                self?.handle(connection: connection)
            }
            self.listener?.start(queue: .global(qos: .userInteractive))
            NSLog("[Miki Server] Local HTTP server listening on http://127.0.0.1:%d", port)
        } catch {
            NSLog("[Miki Server] Failed to start local server: %@", error.localizedDescription)
        }
    }

    private func handle(connection: NWConnection) {
        connection.start(queue: .global(qos: .userInteractive))
        connection.receive(minimumIncompleteLength: 1, maximumLength: 16384) { [weak self] data, _, _, _ in
            guard let self = self, let data = data, let reqStr = String(data: data, encoding: .utf8) else {
                connection.cancel()
                return
            }

            let firstLine = reqStr.components(separatedBy: "\r\n").first ?? ""
            let parts = firstLine.components(separatedBy: " ")
            let rawPath = parts.count > 1 ? parts[1] : "/"
            let cleanPath = rawPath.components(separatedBy: "?").first ?? "/"

            // Direct native YouTube Music live search endpoint (zero CORS, ultra fast)
            if cleanPath == "/api/search-youtube" || cleanPath.hasPrefix("/api/search-youtube") {
                let queryItems = URLComponents(string: rawPath)?.queryItems
                let q = queryItems?.first(where: { $0.name == "q" })?.value ?? ""
                let cleanQ = q.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !cleanQ.isEmpty else {
                    let emptyResp = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n[]"
                    connection.send(content: emptyResp.data(using: .utf8)!, completion: .contentProcessed({ _ in connection.cancel() }))
                    return
                }

                let searchUrl = URL(string: "https://www.youtube.com/youtubei/v1/search")!
                var req = URLRequest(url: searchUrl)
                req.httpMethod = "POST"
                req.setValue("application/json", forHTTPHeaderField: "Content-Type")
                let payload: [String: Any] = [
                    "context": ["client": ["clientName": "WEB", "clientVersion": "2.20240101.01.00", "hl": "en"]],
                    "query": "\(cleanQ) audio"
                ]
                req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

                URLSession.shared.dataTask(with: req) { data, _, _ in
                    guard let data = data,
                          let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                          let contents = root["contents"] as? [String: Any],
                          let twoCol = contents["twoColumnSearchResultsRenderer"] as? [String: Any],
                          let primary = twoCol["primaryContents"] as? [String: Any],
                          let secList = primary["sectionListRenderer"] as? [String: Any],
                          let secContents = secList["contents"] as? [[String: Any]] else {
                        let emptyResp = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n[]"
                        connection.send(content: emptyResp.data(using: .utf8)!, completion: .contentProcessed({ _ in connection.cancel() }))
                        return
                    }

                    var tracks: [[String: Any]] = []
                    for sec in secContents {
                        if let itemSec = sec["itemSectionRenderer"] as? [String: Any],
                           let itemContents = itemSec["contents"] as? [[String: Any]] {
                            for item in itemContents {
                                guard let v = item["videoRenderer"] as? [String: Any],
                                      let videoId = v["videoId"] as? String else { continue }
                                let titleRuns = (v["title"] as? [String: Any])?["runs"] as? [[String: Any]]
                                let rawTitle = titleRuns?.first?["text"] as? String ?? cleanQ
                                let ownerRuns = ((v["ownerText"] as? [String: Any])?["runs"] as? [[String: Any]])
                                let artist = ownerRuns?.first?["text"] as? String ?? "Official Artist"
                                let durationText = (v["lengthText"] as? [String: Any])?["simpleText"] as? String ?? "3:45"

                                tracks.append([
                                    "id": "yt-\(videoId)",
                                    "youtubeId": videoId,
                                    "title": rawTitle,
                                    "artist": artist,
                                    "duration": durationText,
                                    "durationSec": 210,
                                    "coverUrl": "https://img.youtube.com/vi/\(videoId)/hqdefault.jpg",
                                    "streamUrl": "https://www.youtube.com/watch?v=\(videoId)",
                                    "platform": "youtube",
                                    "genre": "YouTube Music",
                                    "badge": "YouTube Music Full Track"
                                ])
                                if tracks.count >= 20 { break }
                            }
                        }
                    }

                    let jsonRespData = (try? JSONSerialization.data(withJSONObject: tracks)) ?? Data("[]".utf8)
                    var header = "HTTP/1.1 200 OK\r\n"
                    header += "Content-Type: application/json; charset=utf-8\r\n"
                    header += "Content-Length: \(jsonRespData.count)\r\n"
                    header += "Access-Control-Allow-Origin: *\r\n"
                    header += "Cache-Control: no-cache\r\n"
                    header += "Connection: close\r\n\r\n"
                    var resp = header.data(using: .utf8)!
                    resp.append(jsonRespData)
                    connection.send(content: resp, completion: .contentProcessed({ _ in connection.cancel() }))
                }.resume()
                return
            }

            // Direct native YouTube audio stream resolution & streaming endpoint (Hidara pattern)
            if cleanPath == "/api/stream-audio" || cleanPath.hasPrefix("/api/stream-audio") {
                let queryItems = URLComponents(string: rawPath)?.queryItems
                let rawId = queryItems?.first(where: { $0.name == "id" })?.value ?? ""
                let rawUrl = queryItems?.first(where: { $0.name == "url" })?.value ?? ""
                let redirect = queryItems?.first(where: { $0.name == "redirect" })?.value == "true"
                let isStream = queryItems?.first(where: { $0.name == "stream" })?.value == "true" ||
                               reqStr.lowercased().contains("range:") ||
                               reqStr.lowercased().contains("accept: audio")
                
                var videoId = rawId.trimmingCharacters(in: .whitespacesAndNewlines)
                if videoId.isEmpty && !rawUrl.isEmpty {
                    if let match = rawUrl.range(of: "([a-zA-Z0-9_-]{11})", options: .regularExpression) {
                        videoId = String(rawUrl[match])
                    }
                }
                
                guard !videoId.isEmpty else {
                    let errResp = "HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n{\"error\":\"missing_id\"}"
                    connection.send(content: errResp.data(using: .utf8)!, completion: .contentProcessed({ _ in connection.cancel() }))
                    return
                }

                self.resolveAudioStream(videoId: videoId) { resolvedUrl in
                    if let directUrl = resolvedUrl {
                        if redirect {
                            var redirectResp = "HTTP/1.1 302 Found\r\n"
                            redirectResp += "Location: \(directUrl)\r\n"
                            redirectResp += "Access-Control-Allow-Origin: *\r\n"
                            redirectResp += "Connection: close\r\n\r\n"
                            connection.send(content: redirectResp.data(using: .utf8)!, completion: .contentProcessed({ _ in connection.cancel() }))
                        } else if isStream {
                            // Hidara audio proxy: forward range requests with valid yt-dlp User-Agent & CORS headers
                            guard let targetUrl = URL(string: directUrl) else {
                                let errResp = "HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n"
                                connection.send(content: errResp.data(using: .utf8)!, completion: .contentProcessed({ _ in connection.cancel() }))
                                return
                            }
                            var upstreamReq = URLRequest(url: targetUrl)
                            upstreamReq.setValue("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36", forHTTPHeaderField: "User-Agent")
                            if let clientRange = reqStr.components(separatedBy: "\r\n").first(where: { $0.lowercased().hasPrefix("range:") }) {
                                let rangeVal = clientRange.components(separatedBy: ":").dropFirst().joined(separator: ":").trimmingCharacters(in: .whitespaces)
                                upstreamReq.setValue(rangeVal, forHTTPHeaderField: "Range")
                            } else {
                                upstreamReq.setValue("bytes=0-", forHTTPHeaderField: "Range")
                            }
                            let proxyDelegate = StreamProxySession(connection: connection)
                            let session = URLSession(configuration: .default, delegate: proxyDelegate, delegateQueue: nil)
                            proxyDelegate.session = session
                            self.proxySessionsLock.lock()
                            self.activeProxySessions.insert(proxyDelegate)
                            self.proxySessionsLock.unlock()

                            proxyDelegate.onFinish = { [weak self, weak proxyDelegate] in
                                guard let self = self, let proxyDelegate = proxyDelegate else { return }
                                self.proxySessionsLock.lock()
                                self.activeProxySessions.remove(proxyDelegate)
                                self.proxySessionsLock.unlock()
                                proxyDelegate.session?.finishTasksAndInvalidate()
                                proxyDelegate.session = nil
                            }

                            let dataTask = session.dataTask(with: upstreamReq)
                            dataTask.resume()
                        } else {
                            let jsonPayload: [String: Any] = [
                                "url": directUrl,
                                "id": videoId,
                                "source": "youtube",
                                "kind": "direct_stream"
                            ]
                            let jsonData = (try? JSONSerialization.data(withJSONObject: jsonPayload)) ?? Data("{}".utf8)
                            var header = "HTTP/1.1 200 OK\r\n"
                            header += "Content-Type: application/json; charset=utf-8\r\n"
                            header += "Content-Length: \(jsonData.count)\r\n"
                            header += "Access-Control-Allow-Origin: *\r\n"
                            header += "Cache-Control: no-cache\r\n"
                            header += "Connection: close\r\n\r\n"
                            var resp = header.data(using: .utf8)!
                            resp.append(jsonData)
                            connection.send(content: resp, completion: .contentProcessed({ _ in connection.cancel() }))
                        }
                    } else {
                        let jsonPayload: [String: Any] = [
                            "url": "https://www.youtube.com/watch?v=\(videoId)",
                            "id": videoId,
                            "source": "youtube",
                            "fallback": true
                        ]
                        let jsonData = (try? JSONSerialization.data(withJSONObject: jsonPayload)) ?? Data("{}".utf8)
                        var header = "HTTP/1.1 200 OK\r\n"
                        header += "Content-Type: application/json; charset=utf-8\r\n"
                        header += "Content-Length: \(jsonData.count)\r\n"
                        header += "Access-Control-Allow-Origin: *\r\n"
                        header += "Connection: close\r\n\r\n"
                        var resp = header.data(using: .utf8)!
                        resp.append(jsonData)
                        connection.send(content: resp, completion: .contentProcessed({ _ in connection.cancel() }))
                    }
                }
                return
            }

            let relPath = (cleanPath == "/" || cleanPath.isEmpty) ? "index.html" : (cleanPath.hasPrefix("/") ? String(cleanPath.dropFirst()) : cleanPath)

            let fileUrl = self.baseDir.appendingPathComponent(relPath)
            if let fileData = try? Data(contentsOf: fileUrl) {
                let ext = fileUrl.pathExtension.lowercased()
                let mime: String
                switch ext {
                case "html": mime = "text/html"
                case "js", "mjs": mime = "application/javascript"
                case "css": mime = "text/css"
                case "png": mime = "image/png"
                case "jpg", "jpeg": mime = "image/jpeg"
                case "svg": mime = "image/svg+xml"
                case "json": mime = "application/json"
                case "woff2": mime = "font/woff2"
                case "woff": mime = "font/woff"
                case "ttf": mime = "font/ttf"
                case "ico": mime = "image/x-icon"
                default: mime = "application/octet-stream"
                }

                var header = "HTTP/1.1 200 OK\r\n"
                header += "Content-Type: \(mime)\r\n"
                header += "Content-Length: \(fileData.count)\r\n"
                header += "Access-Control-Allow-Origin: *\r\n"
                header += "Cache-Control: no-cache\r\n"
                header += "Connection: close\r\n\r\n"

                var resp = header.data(using: .utf8)!
                resp.append(fileData)
                connection.send(content: resp, completion: .contentProcessed({ _ in
                    connection.cancel()
                }))
            } else {
                let notFound = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
                connection.send(content: notFound.data(using: .utf8), completion: .contentProcessed({ _ in
                    connection.cancel()
                }))
            }
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
    var window: BorderlessKeyWindow!
    var webView: WKWebView!
    var browserWebView: WKWebView?
    var isAdShieldEnabled: Bool = true
    var isCustomFullScreen = false
    var savedFrame: NSRect = .zero
    var currentVolume: Double = 1.0
    var isMuted: Bool = false
    var localServer: LocalAppServer?

    private func applySoundToBrowserWebView() {
        guard let bView = self.browserWebView else { return }
        let js = """
        (function() {
            window.__mikiVolume = \(self.currentVolume);
            window.__mikiMuted = \(self.isMuted ? "true" : "false");
            var syncMediaSound = function() {
                try {
                    var media = document.querySelectorAll('video, audio');
                    media.forEach(function(el) {
                        try {
                            el.volume = window.__mikiVolume;
                            el.muted = window.__mikiMuted;
                        } catch(e) {}
                    });
                } catch(e) {}
            };
            syncMediaSound();
            if (!window.__mikiSoundObserver) {
                window.__mikiSoundObserver = new MutationObserver(syncMediaSound);
                window.__mikiSoundObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
                setInterval(syncMediaSound, 1000);
            }
        })();
        """
        bView.evaluateJavaScript(js, completionHandler: nil)
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMainMenu()

        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 100, y: 100, width: 1280, height: 720)
        let windowWidth: CGFloat = 1280
        let windowHeight: CGFloat = 720
        let xPos = screenRect.midX - (windowWidth / 2)
        let yPos = screenRect.midY - (windowHeight / 2)
        let contentRect = NSRect(x: xPos, y: yPos, width: windowWidth, height: windowHeight)

        // Fully Undecorated / Borderless window with KEY window keyboard capability
        window = BorderlessKeyWindow(
            contentRect: contentRect,
            styleMask: [.borderless, .resizable, .miniaturizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Miki Player"
        window.isOpaque = false
        window.backgroundColor = NSColor(calibratedRed: 0.04, green: 0.05, blue: 0.08, alpha: 1.0)
        window.hasShadow = true
        window.isMovableByWindowBackground = true
        window.minSize = NSSize(width: 720, height: 440)
        window.collectionBehavior = [.fullScreenPrimary, .managed]
        window.delegate = self

        // Configure WKWebView with full media playback capabilities
        let config = WKWebViewConfiguration()
        config.mediaTypesRequiringUserActionForPlayback = []
        config.allowsAirPlayForMediaPlayback = true
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        if #available(macOS 12.0, *) {
            config.preferences.isElementFullscreenEnabled = true
        }

        // Register custom scheme handlers:
        // 1. "app://" for serving the bundled React SPA assets with standard CORS origin isolation
        // 2. "media-stream://" for local file streaming with HTTP 206 byte-range seeking
        config.setURLSchemeHandler(AppAssetSchemeHandler(), forURLScheme: "app")
        config.setURLSchemeHandler(MediaStreamSchemeHandler(), forURLScheme: "media-stream")

        // Window controls & Native dialogs IPC script handler
        let contentController = WKUserContentController()
        contentController.add(self, name: "windowAction")
        contentController.add(self, name: "openNativeFileDialog")
        contentController.add(self, name: "openNativeDirectoryDialog")
        contentController.add(self, name: "saveScreenshot")
        contentController.add(self, name: "requestSystemAccess")
        contentController.add(self, name: "browserViewAction")
        contentController.add(self, name: "browserMediaDetected")
        contentController.add(self, name: "searchYouTubeMusic")
        config.userContentController = contentController

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.setValue(false, forKey: "drawsBackground") // Transparent background
        webView.uiDelegate = self
        webView.navigationDelegate = self

        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        window.makeFirstResponder(webView)
        NSApp.activate(ignoringOtherApps: true)

        // Production: Start local HTTP server to guarantee valid HTTP Referer headers for YouTube embed playback
        if let distUrl = AppAssetSchemeHandler.getDistUrl() {
            let srv = LocalAppServer(baseDir: distUrl)
            srv.start()
            self.localServer = srv
            let appUrl = URL(string: "http://127.0.0.1:39281/index.html")!
            webView.load(URLRequest(url: appUrl))
        } else {
            let appUrl = URL(string: "app://localhost/index.html")!
            webView.load(URLRequest(url: appUrl))
        }
    }

    // Fallback loadFileURL method for legacy direct file loading
    private func loadFileUrlFallback(_ url: URL) {
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    private func setupMainMenu() {
        let mainMenu = NSMenu()
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenuItem.submenu = appMenu
        let prefItem = NSMenuItem(title: "Google / Gmail Account...", action: #selector(openGmailSignIn), keyEquivalent: "g")
        prefItem.target = self
        appMenu.addItem(prefItem)
        let themesItem = NSMenuItem(title: "Themes & Video Filters...", action: #selector(openThemesAndSettings), keyEquivalent: "t")
        themesItem.target = self
        appMenu.addItem(themesItem)
        let eqItem = NSMenuItem(title: "3D Spatial Sound & EQ...", action: #selector(openEqualizer), keyEquivalent: "e")
        eqItem.target = self
        appMenu.addItem(eqItem)
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Miki Player", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        // File Menu
        let fileMenuItem = NSMenuItem()
        mainMenu.addItem(fileMenuItem)
        let fileMenu = NSMenu(title: "File")
        fileMenuItem.submenu = fileMenu
        let openFileItem = NSMenuItem(title: "Open Local File...", action: #selector(openLocalFile), keyEquivalent: "o")
        openFileItem.target = self
        fileMenu.addItem(openFileItem)
        let libItem = NSMenuItem(title: "Media Explorer & Library...", action: #selector(openLibrary), keyEquivalent: "l")
        libItem.target = self
        fileMenu.addItem(libItem)

        // Edit menu to allow Cmd+C, Cmd+V, Cmd+A, Cmd+Z in text inputs
        let editMenuItem = NSMenuItem()
        mainMenu.addItem(editMenuItem)
        let editMenu = NSMenu(title: "Edit")
        editMenuItem.submenu = editMenu
        editMenu.addItem(withTitle: "Undo", action: #selector(UndoManager.undo), keyEquivalent: "z")
        editMenu.addItem(withTitle: "Redo", action: #selector(UndoManager.redo), keyEquivalent: "Z")
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")

        // Account & Services Menu
        let accountMenuItem = NSMenuItem()
        mainMenu.addItem(accountMenuItem)
        let accountMenu = NSMenu(title: "Account")
        accountMenuItem.submenu = accountMenu
        let signInItem = NSMenuItem(title: "Sign in with Google / Gmail...", action: #selector(openGmailSignIn), keyEquivalent: "g")
        signInItem.target = self
        accountMenu.addItem(signInItem)

        // Web Streams Menu (YouTube, TikTok, Instagram, Cinema, Web Browser)
        let streamMenuItem = NSMenuItem()
        mainMenu.addItem(streamMenuItem)
        let streamMenu = NSMenu(title: "Streams")
        streamMenuItem.submenu = streamMenu
        let browseItem = NSMenuItem(title: "Browse Protected Web...", action: #selector(openWebBrowser), keyEquivalent: "b")
        browseItem.target = self
        streamMenu.addItem(browseItem)
        let cinemaItem = NSMenuItem(title: "Cinema & CineSubz Streams...", action: #selector(openCinemaPortal), keyEquivalent: "m")
        cinemaItem.target = self
        streamMenu.addItem(cinemaItem)
        streamMenu.addItem(NSMenuItem.separator())
        let ytItem = NSMenuItem(title: "YouTube Web Stream...", action: #selector(openYouTubeStream), keyEquivalent: "y")
        ytItem.target = self
        streamMenu.addItem(ytItem)
        let ttItem = NSMenuItem(title: "TikTok Web Stream...", action: #selector(openTikTokStream), keyEquivalent: "t")
        ttItem.target = self
        streamMenu.addItem(ttItem)
        let igItem = NSMenuItem(title: "Instagram Web Stream...", action: #selector(openInstagramStream), keyEquivalent: "i")
        igItem.target = self
        streamMenu.addItem(igItem)

        NSApp.mainMenu = mainMenu
    }

    @objc func openWebBrowser() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-web-browser', { detail: { url: 'https://www.youtube.com' } }));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openCinemaPortal() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-web-browser', { detail: { url: 'https://cinesubz.lk' } }));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openLocalFile() {
        let js = "document.getElementById('miki-main-file-input')?.click();"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openLibrary() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-library'));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openThemesAndSettings() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-settings'));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openEqualizer() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-eq'));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openGmailSignIn() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-gmail-signin'));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openYouTubeStream() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-web-stream', { detail: { tab: 'youtube' } }));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openTikTokStream() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-web-stream', { detail: { tab: 'tiktok' } }));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func openInstagramStream() {
        let js = "window.dispatchEvent(new CustomEvent('miki:open-web-stream', { detail: { tab: 'instagram' } }));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    final class SafeCompletionWrapper {
        private var handler: (([URL]?) -> Void)?
        init(_ handler: @escaping ([URL]?) -> Void) {
            self.handler = handler
        }
        func complete(with urls: [URL]?) {
            let h = handler
            handler = nil
            h?(urls)
        }
        deinit {
            handler?(nil)
        }
    }

    func windowDidResize(_ notification: Notification) {
        updateBrowserViewLayout()
    }

    func updateBrowserViewLayout() {
        guard let bView = browserWebView, !bView.isHidden, let content = window?.contentView else { return }
        bView.frame = NSRect(x: 0, y: 0, width: content.bounds.width, height: max(100, content.bounds.height - 44))
    }

    func setupBrowserWebView() -> WKWebView {
        if let existing = browserWebView {
            return existing
        }

        let config = WKWebViewConfiguration()
        config.allowsAirPlayForMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        if #available(macOS 12.0, *) {
            config.preferences.isElementFullscreenEnabled = true
        }

        let bContentController = WKUserContentController()
        bContentController.add(self, name: "browserMediaDetected")

        // Injected intelligent ad-blocking & universal media detection script
        // Supported formats: .m3u8, .mpd, .mp4, .mkv, .webm, .flv, .ts, .avi, .mov
        let helperScript = """
        (function() {
            var reportedMedia = new Set();
            var mediaRegex = /\\.(m3u8|mpd|mp4|mkv|webm|avi|mov|flv|m4v|3gp|mp3|m4a|aac|wav|ogg|opus)(\\?|$)/i;
            var streamRegex = /(master\\.m3u8|playlist\\.m3u8|\\/hls\\/|\\/dash\\/|\\/manifest|\\/stream\\/|googlevideo\\.com\\/videoplayback)/i;

            function reportMedia(url, type) {
                if (!url || typeof url !== 'string' || reportedMedia.has(url)) return;
                if (url.indexOf('blob:') === 0 || url.indexOf('data:') === 0) return;
                reportedMedia.add(url);
                try {
                    window.webkit.messageHandlers.browserMediaDetected.postMessage({
                        url: url,
                        title: document.title || 'Detected Video Stream',
                        format: type || 'video'
                    });
                } catch(e) {}
            }

            // Monkey-patch window.fetch for async manifest & video segment requests
            var origFetch = window.fetch;
            if (origFetch) {
                window.fetch = function(input, init) {
                    try {
                        var url = typeof input === 'string' ? input : (input && input.url);
                        if (url && (mediaRegex.test(url) || streamRegex.test(url))) {
                            reportMedia(url, 'stream');
                        }
                    } catch(e) {}
                    return origFetch.apply(this, arguments);
                };
            }

            // Monkey-patch XMLHttpRequest.prototype.open
            var origXhrOpen = XMLHttpRequest.prototype.open;
            if (origXhrOpen) {
                XMLHttpRequest.prototype.open = function(method, url) {
                    try {
                        if (url && (mediaRegex.test(url) || streamRegex.test(url))) {
                            reportMedia(url, 'xhr');
                        }
                    } catch(e) {}
                    return origXhrOpen.apply(this, arguments);
                };
            }

            // Monkey-patch HTMLMediaElement.prototype.play
            var origPlay = HTMLMediaElement.prototype.play;
            if (origPlay) {
                HTMLMediaElement.prototype.play = function() {
                    try {
                        var src = this.currentSrc || this.src;
                        if (src && src.indexOf('blob:') === -1) {
                            reportMedia(src, 'element');
                        }
                    } catch(e) {}
                    return origPlay.apply(this, arguments);
                };
            }

            // Scan DOM video elements
            function scanElements() {
                var mediaEls = document.querySelectorAll('video, audio, source');
                for (var i = 0; i < mediaEls.length; i++) {
                    var el = mediaEls[i];
                    var src = el.currentSrc || el.src;
                    if (src && src.indexOf('blob:') === -1) {
                        reportMedia(src, 'element');
                    }
                }
            }

            // MutationObserver to capture dynamically injected video players & iframes
            var observer = new MutationObserver(function(mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var mut = mutations[i];
                    for (var j = 0; j < mut.addedNodes.length; j++) {
                        var node = mut.addedNodes[j];
                        if (node.nodeType === 1) {
                            if (node.tagName === 'VIDEO' || node.tagName === 'SOURCE' || node.tagName === 'AUDIO') {
                                var src = node.currentSrc || node.src;
                                if (src && src.indexOf('blob:') === -1) reportMedia(src, 'dom');
                            }
                        }
                    }
                }
            });

            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    if (document.body) {
                        observer.observe(document.body, { childList: true, subtree: true });
                    }
                });
            }

            // Anti-popup & redirect trapping suppression
            window.open = function() { return null; };
            document.addEventListener('play', scanElements, true);
            document.addEventListener('loadeddata', scanElements, true);
            setInterval(scanElements, 2500);
        })();
        """
        let userScript = WKUserScript(source: helperScript, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        bContentController.addUserScript(userScript)
        config.userContentController = bContentController

        let contentBounds = window.contentView?.bounds ?? NSRect(x: 0, y: 0, width: 1280, height: 720)
        let initialFrame = NSRect(x: 0, y: 0, width: contentBounds.width, height: max(100, contentBounds.height - 44))
        let bView = WKWebView(frame: initialFrame, configuration: config)
        bView.autoresizingMask = [.width, .height]
        bView.wantsLayer = true
        bView.setValue(true, forKey: "drawsBackground")
        bView.customUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
        bView.uiDelegate = self
        bView.navigationDelegate = self
        bView.isHidden = true

        window.contentView?.addSubview(bView)
        browserWebView = bView
        return bView
    }

    func isAdUrl(_ urlStr: String) -> Bool {
        let adKeywords = [
            "doubleclick", "popads", "bet365", "onclick", "adsterra", "adservice",
            "syndication", "monetag", "adcash", "propellerads", "exoclick", "popcash",
            "hilltopads", "adnxs", "trafficjunky", "zeroredirect", "ad-delivery",
            "track", "popup", "promotions", "banner", "affiliate", "casino", "1xbet",
            "betting", "crypto-ad", "adkeeper", "clickadu", "richpush", "juicyads",
            "adoperator", "trafficstars", "coinhive", "directrev", "deloton"
        ]
        let lower = urlStr.lowercased()
        return adKeywords.contains { lower.contains($0) }
    }

    // WKUIDelegate: Intercept & block intrusive popups while allowing legitimate movie/video page links
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let targetUrl = navigationAction.request.url {
            let urlStr = targetUrl.absoluteString
            if !isAdUrl(urlStr) {
                if webView == self.browserWebView {
                    self.browserWebView?.load(navigationAction.request)
                } else {
                    let escaped = urlStr.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
                    let js = "window.dispatchEvent(new CustomEvent('miki:navigate-web-browser', { detail: { url: '\(escaped)' } }));"
                    self.webView.evaluateJavaScript(js, completionHandler: nil)
                }
            } else {
                NSLog("[Miki Shield] Intercepted and blocked popup window creation for: %@", urlStr)
                let js = "window.dispatchEvent(new CustomEvent('miki:browser-ad-blocked'));"
                self.webView.evaluateJavaScript(js, completionHandler: nil)
            }
        }
        return nil
    }

    // WKNavigationDelegate: tracking page loading & updating top bar
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        if webView == self.browserWebView, let url = webView.url?.absoluteString {
            let clean = url.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
            let js = "window.dispatchEvent(new CustomEvent('miki:browser-loading-start', { detail: { url: '\(clean)' } }));"
            self.webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if webView == self.browserWebView {
            let url = webView.url?.absoluteString ?? ""
            let title = webView.title ?? ""
            let cleanUrl = url.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
            let cleanTitle = title.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
            let js = "window.dispatchEvent(new CustomEvent('miki:browser-loading-finish', { detail: { url: '\(cleanUrl)', title: '\(cleanTitle)' } }));"
            self.webView.evaluateJavaScript(js, completionHandler: nil)
            self.applySoundToBrowserWebView()
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        if webView == self.browserWebView {
            let js = "window.dispatchEvent(new CustomEvent('miki:browser-loading-finish', { detail: { error: '\(error.localizedDescription)' } }));"
            self.webView.evaluateJavaScript(js, completionHandler: nil)
        } else if webView == self.webView {
            NSLog("[Miki] Main webView navigation failed: %@. Falling back to dev server.", error.localizedDescription)
            let devUrl = URL(string: "http://localhost:1420/")!
            self.webView.load(URLRequest(url: devUrl))
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if webView == self.browserWebView {
            let js = "window.dispatchEvent(new CustomEvent('miki:browser-loading-finish', { detail: { error: '\(error.localizedDescription)' } }));"
            self.webView.evaluateJavaScript(js, completionHandler: nil)
        } else if webView == self.webView {
            NSLog("[Miki] Main webView provisional navigation failed: %@. Falling back to dev server.", error.localizedDescription)
            let devUrl = URL(string: "http://localhost:1420/")!
            self.webView.load(URLRequest(url: devUrl))
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if webView == self.browserWebView, self.isAdShieldEnabled, let targetUrl = navigationAction.request.url?.absoluteString {
            if isAdUrl(targetUrl) {
                NSLog("[Miki Shield] Blocked ad navigation: %@", targetUrl)
                let js = "window.dispatchEvent(new CustomEvent('miki:browser-ad-blocked'));"
                self.webView.evaluateJavaScript(js, completionHandler: nil)
                decisionHandler(.cancel)
                return
            }
        }
        decisionHandler(.allow)
    }

    // WKUIDelegate: native file picker when <input type="file"> is clicked
    func webView(
        _ webView: WKWebView,
        runOpenPanelWith parameters: WKOpenPanelParameters,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping ([URL]?) -> Void
    ) {
        let wrapper = SafeCompletionWrapper(completionHandler)
        let openPanel = NSOpenPanel()
        openPanel.title = "Select Media File - Miki Player"
        openPanel.canChooseFiles = true
        openPanel.canChooseDirectories = false
        openPanel.allowsMultipleSelection = parameters.allowsMultipleSelection
        if #available(macOS 11.0, *) {
            openPanel.allowedContentTypes = [.movie, .video, .audio, .mpeg4Movie, .quickTimeMovie, .image, .png, .jpeg, .webP]
        }
        openPanel.begin { response in
            if response == .OK {
                wrapper.complete(with: openPanel.urls)
            } else {
                wrapper.complete(with: nil)
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if message.name == "windowAction", let action = message.body as? String {
                switch action {
                case "startDrag":
                    if self.isCustomFullScreen {
                        self.window.setFrame(self.savedFrame, display: true, animate: false)
                        self.window.level = .normal
                        self.isCustomFullScreen = false
                    }
                    let dragEvent = (self.window.lastMouseDownEvent?.type == .leftMouseDown) ? self.window.lastMouseDownEvent : NSApp.currentEvent
                    if let event = dragEvent {
                        self.window.performDrag(with: event)
                    }
                case "close":
                    NSApp.terminate(nil)
                case "minimize":
                    self.window.miniaturize(nil)
                case "maximize":
                    self.window.zoom(nil)
                case "toggleFullscreen":
                    if self.isCustomFullScreen {
                        self.window.setFrame(self.savedFrame, display: true, animate: true)
                        self.window.level = .normal
                        self.isCustomFullScreen = false
                    } else {
                        self.savedFrame = self.window.frame
                        if let screen = self.window.screen ?? NSScreen.main {
                            self.window.level = .mainMenu + 1
                            self.window.setFrame(screen.frame, display: true, animate: true)
                            self.isCustomFullScreen = true
                        }
                    }
                default:
                    break
                }
            } else if message.name == "openNativeFileDialog" {
                let openPanel = NSOpenPanel()
                openPanel.title = "Select Media File - Miki Player"
                openPanel.canChooseFiles = true
                openPanel.canChooseDirectories = false
                openPanel.allowsMultipleSelection = false
                if #available(macOS 11.0, *) {
                    openPanel.allowedContentTypes = [.movie, .video, .audio, .mpeg4Movie, .quickTimeMovie]
                }
                openPanel.begin { [weak self] response in
                    if response == .OK, let selectedUrl = openPanel.url {
                        let escapedPath = selectedUrl.path.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
                        let escapedName = selectedUrl.lastPathComponent.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
                        let js = "window.dispatchEvent(new CustomEvent('miki:nativeFileSelected', { detail: { path: '\(escapedPath)', name: '\(escapedName)' } }));"
                        self?.webView.evaluateJavaScript(js, completionHandler: nil)
                    }
                }
            } else if message.name == "openNativeDirectoryDialog" {
                let openPanel = NSOpenPanel()
                openPanel.title = "Select Screenshot Save Folder - Miki Player"
                openPanel.canChooseFiles = false
                openPanel.canChooseDirectories = true
                openPanel.canCreateDirectories = true
                openPanel.allowsMultipleSelection = false
                openPanel.begin { [weak self] response in
                    if response == .OK, let selectedUrl = openPanel.url {
                        let escapedPath = selectedUrl.path.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
                        let js = "window.dispatchEvent(new CustomEvent('miki:nativeDirectorySelected', { detail: { path: '\(escapedPath)' } }));"
                        self?.webView.evaluateJavaScript(js, completionHandler: nil)
                    }
                }
            } else if message.name == "saveScreenshot", let dict = message.body as? [String: Any] {
                let base64Data = dict["base64Data"] as? String ?? ""
                let filename = dict["filename"] as? String ?? "miki-snapshot-\(Int(Date().timeIntervalSince1970)).png"
                var dirPath = dict["directory"] as? String ?? "~/Pictures/Miki Player/Screenshots"

                if dirPath.hasPrefix("~/") {
                    let home = FileManager.default.homeDirectoryForCurrentUser.path
                    dirPath = dirPath.replacingOccurrences(of: "~", with: home, options: .anchored)
                }

                let cleanBase64: String
                if let commaIndex = base64Data.firstIndex(of: ",") {
                    cleanBase64 = String(base64Data[base64Data.index(after: commaIndex)...])
                } else {
                    cleanBase64 = base64Data
                }

                if let imgData = Data(base64Encoded: cleanBase64) {
                    do {
                        try FileManager.default.createDirectory(atPath: dirPath, withIntermediateDirectories: true, attributes: nil)
                        let targetFileUrl = URL(fileURLWithPath: dirPath).appendingPathComponent(filename)
                        try imgData.write(to: targetFileUrl)
                        let savedPath = targetFileUrl.path.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
                        let js = "window.dispatchEvent(new CustomEvent('miki:screenshotSaved', { detail: { path: '\(savedPath)' } }));"
                        self.webView.evaluateJavaScript(js, completionHandler: nil)
                    } catch {
                        print("[Miki] Screenshot write failed: \(error)")
                    }
                }
            } else if message.name == "requestSystemAccess" {
                // Ensure screenshot and user directories exist and trigger system access validation
                let home = FileManager.default.homeDirectoryForCurrentUser.path
                let screenshotsDir = "\(home)/Pictures/Miki Player/Screenshots"
                try? FileManager.default.createDirectory(atPath: screenshotsDir, withIntermediateDirectories: true, attributes: nil)
                let js = "window.dispatchEvent(new CustomEvent('miki:systemAccessGranted', { detail: { status: 'granted' } }));"
                self.webView.evaluateJavaScript(js, completionHandler: nil)
            } else if message.name == "browserViewAction" {
                if let dict = message.body as? [String: Any], let action = dict["action"] as? String {
                    switch action {
                    case "open":
                        let targetUrl = dict["url"] as? String ?? "https://cinesubz.lk"
                        let bView = self.setupBrowserWebView()
                        bView.isHidden = false
                        bView.alphaValue = 1.0
                        if self.webView != nil {
                            self.window.contentView?.addSubview(bView, positioned: .above, relativeTo: self.webView)
                        }
                        self.updateBrowserViewLayout()
                        if let url = URL(string: targetUrl) {
                            bView.load(URLRequest(url: url))
                        }
                        self.window.makeFirstResponder(bView)
                    case "close":
                        if let bView = self.browserWebView {
                            bView.isHidden = true
                            bView.load(URLRequest(url: URL(string: "about:blank")!))
                        }
                        self.window.makeFirstResponder(self.webView)
                    case "reload":
                        self.browserWebView?.reload()
                    case "goBack":
                        if self.browserWebView?.canGoBack == true {
                            self.browserWebView?.goBack()
                        }
                    case "goForward":
                        if self.browserWebView?.canGoForward == true {
                            self.browserWebView?.goForward()
                        }
                    case "navigate":
                        if let targetUrl = dict["url"] as? String, let url = URL(string: targetUrl) {
                            self.browserWebView?.load(URLRequest(url: url))
                        }
                    case "toggleShield":
                        if let enabled = dict["enabled"] as? Bool {
                            self.isAdShieldEnabled = enabled
                        }
                    case "setOverlayVisible":
                        if let visible = dict["visible"] as? Bool {
                            if visible {
                                self.browserWebView?.alphaValue = 0.0
                                if let wView = self.webView {
                                    self.window.contentView?.addSubview(wView, positioned: .above, relativeTo: self.browserWebView)
                                    self.window.makeFirstResponder(wView)
                                }
                            } else {
                                self.browserWebView?.alphaValue = 1.0
                                if let bView = self.browserWebView, !bView.isHidden {
                                    self.window.contentView?.addSubview(bView, positioned: .above, relativeTo: self.webView)
                                    self.window.makeFirstResponder(bView)
                                }
                            }
                        }
                    case "setVolume":
                        let vol = dict["volume"] as? Double ?? 100.0
                        let muted = dict["isMuted"] as? Bool ?? false
                        self.currentVolume = max(0.0, min(1.0, vol / 100.0))
                        self.isMuted = muted
                        self.applySoundToBrowserWebView()
                    case "setEqualizer":
                        let gains = dict["gainsDb"] as? [Double] ?? []
                        let nightMode = dict["nightMode"] as? Bool ?? false
                        let js = """
                        (function() {
                            window.__mikiEqGains = \(gains);
                            window.__mikiNightMode = \(nightMode ? "true" : "false");
                            window.dispatchEvent(new CustomEvent('miki:equalizer-sync', { detail: { gains: \(gains), nightMode: \(nightMode ? "true" : "false") } }));
                        })();
                        """
                        self.browserWebView?.evaluateJavaScript(js, completionHandler: nil)
                    default:
                        break
                    }
                }
            } else if message.name == "browserMediaDetected" {
                if let dict = message.body as? [String: Any] {
                    let mediaUrl = dict["url"] as? String ?? ""
                    let title = dict["title"] as? String ?? ""
                    let cleanUrl = mediaUrl.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
                    let cleanTitle = title.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
                    let js = "window.dispatchEvent(new CustomEvent('miki:browser-media-detected', { detail: { url: '\(cleanUrl)', title: '\(cleanTitle)' } }));"
                    self.webView.evaluateJavaScript(js, completionHandler: nil)
                }
            } else if message.name == "searchYouTubeMusic", let dict = message.body as? [String: Any] {
                let query = dict["query"] as? String ?? ""
                let requestId = dict["requestId"] as? String ?? "yt-def"
                let cleanQuery = query.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !cleanQuery.isEmpty else { return }

                let searchUrl = URL(string: "https://www.youtube.com/youtubei/v1/search")!
                var req = URLRequest(url: searchUrl)
                req.httpMethod = "POST"
                req.setValue("application/json", forHTTPHeaderField: "Content-Type")
                let payload: [String: Any] = [
                    "context": [
                        "client": [
                            "clientName": "WEB",
                            "clientVersion": "2.20240101.01.00",
                            "hl": "en"
                        ]
                    ],
                    "query": "\(cleanQuery) audio"
                ]
                req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

                URLSession.shared.dataTask(with: req) { [weak self] data, _, _ in
                    guard let self = self,
                          let data = data,
                          let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                          let contents = root["contents"] as? [String: Any],
                          let twoCol = contents["twoColumnSearchResultsRenderer"] as? [String: Any],
                          let primary = twoCol["primaryContents"] as? [String: Any],
                          let secList = primary["sectionListRenderer"] as? [String: Any],
                          let secContents = secList["contents"] as? [[String: Any]],
                          let itemSec = secContents.first?["itemSectionRenderer"] as? [String: Any],
                          let itemContents = itemSec["contents"] as? [[String: Any]] else {
                        return
                    }

                    var tracks: [[String: Any]] = []
                    for item in itemContents {
                        guard let v = item["videoRenderer"] as? [String: Any],
                              let videoId = v["videoId"] as? String else { continue }

                        let titleRuns = (v["title"] as? [String: Any])?["runs"] as? [[String: Any]]
                        let rawTitle = titleRuns?.first?["text"] as? String ?? cleanQuery

                        let ownerRuns = ((v["ownerText"] as? [String: Any])?["runs"] as? [[String: Any]])
                        let artist = ownerRuns?.first?["text"] as? String ?? "Official Artist"

                        let durationText = (v["lengthText"] as? [String: Any])?["simpleText"] as? String ?? "3:45"

                        tracks.append([
                            "id": "yt-\(videoId)",
                            "youtubeId": videoId,
                            "title": rawTitle,
                            "artist": artist,
                            "duration": durationText,
                            "durationSec": 210,
                            "coverUrl": "https://img.youtube.com/vi/\(videoId)/hqdefault.jpg",
                            "streamUrl": "https://www.youtube.com/watch?v=\(videoId)",
                            "platform": "youtube",
                            "genre": "YouTube Music",
                            "badge": "YouTube Music Full Track"
                        ])
                        if tracks.count >= 10 { break }
                    }

                    if let jsonData = try? JSONSerialization.data(withJSONObject: tracks),
                       let jsonString = String(data: jsonData, encoding: .utf8) {
                        DispatchQueue.main.async {
                            let escapedReq = requestId.replacingOccurrences(of: "'", with: "\\'")
                            let js = "window.dispatchEvent(new CustomEvent('miki:youtubeMusicResults', { detail: { requestId: '\(escapedReq)', results: \(jsonString) } }));"
                            self.webView.evaluateJavaScript(js, completionHandler: nil)
                        }
                    }
                }.resume()
            }
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = AppDelegate()
app.delegate = delegate
app.run()
