import Cocoa
import WebKit
import UniformTypeIdentifiers

class BorderlessKeyWindow: NSWindow {
    override var canBecomeKey: Bool {
        return true
    }
    override var canBecomeMain: Bool {
        return true
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKScriptMessageHandler, WKUIDelegate {
    var window: BorderlessKeyWindow!
    var webView: WKWebView!
    var isCustomFullScreen = false
    var savedFrame: NSRect = .zero

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

        // Window controls & Native dialogs IPC script handler
        let contentController = WKUserContentController()
        contentController.add(self, name: "windowAction")
        contentController.add(self, name: "openNativeFileDialog")
        contentController.add(self, name: "openNativeDirectoryDialog")
        contentController.add(self, name: "saveScreenshot")
        contentController.add(self, name: "requestSystemAccess")
        config.userContentController = contentController

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.setValue(false, forKey: "drawsBackground") // Transparent background
        webView.uiDelegate = self

        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        window.makeFirstResponder(webView)
        NSApp.activate(ignoringOtherApps: true)

        let appUrl = URL(string: "http://localhost:1420/")!
        webView.load(URLRequest(url: appUrl))
    }

    private func setupMainMenu() {
        let mainMenu = NSMenu()
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenuItem.submenu = appMenu
        let prefItem = NSMenuItem(title: "Google / Gmail Account...", action: #selector(openGmailSignIn), keyEquivalent: ",")
        prefItem.target = self
        appMenu.addItem(prefItem)
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Miki Player", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

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

        // Web Streams Menu (YouTube, TikTok, Instagram)
        let streamMenuItem = NSMenuItem()
        mainMenu.addItem(streamMenuItem)
        let streamMenu = NSMenu(title: "Streams")
        streamMenuItem.submenu = streamMenu
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

    // WKUIDelegate: native file picker when <input type="file"> is clicked
    func webView(
        _ webView: WKWebView,
        runOpenPanelWith parameters: WKOpenPanelParameters,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping ([URL]?) -> Void
    ) {
        let openPanel = NSOpenPanel()
        openPanel.canChooseFiles = true
        openPanel.canChooseDirectories = false
        openPanel.allowsMultipleSelection = parameters.allowsMultipleSelection
        if #available(macOS 11.0, *) {
            openPanel.allowedContentTypes = [.movie, .video, .audio, .mpeg4Movie, .quickTimeMovie]
        }
        openPanel.begin { response in
            if response == .OK {
                completionHandler(openPanel.urls)
            } else {
                completionHandler(nil)
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
                    if let currentEvent = NSApp.currentEvent {
                        self.window.performDrag(with: currentEvent)
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
