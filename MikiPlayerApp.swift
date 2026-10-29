import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKScriptMessageHandler {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 100, y: 100, width: 1280, height: 720)
        let windowWidth: CGFloat = 1280
        let windowHeight: CGFloat = 720
        let xPos = screenRect.midX - (windowWidth / 2)
        let yPos = screenRect.midY - (windowHeight / 2)
        let contentRect = NSRect(x: xPos, y: yPos, width: windowWidth, height: windowHeight)

        // Fully Undecorated / Borderless window (Zero OS close/minimize/fullscreen buttons)
        window = NSWindow(
            contentRect: contentRect,
            styleMask: [.borderless, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Miki Player"
        window.isOpaque = false
        window.backgroundColor = NSColor(calibratedRed: 0.04, green: 0.05, blue: 0.08, alpha: 1.0)
        window.hasShadow = true
        window.isMovableByWindowBackground = true
        window.minSize = NSSize(width: 720, height: 440)
        window.delegate = self

        // Configure WKWebView with full media playback capabilities
        let config = WKWebViewConfiguration()
        config.mediaTypesRequiringUserActionForPlayback = []
        config.allowsAirPlayForMediaPlayback = true
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        // Window controls IPC script handler
        let contentController = WKUserContentController()
        contentController.add(self, name: "windowAction")
        config.userContentController = contentController

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.setValue(false, forKey: "drawsBackground") // Transparent background

        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        let appUrl = URL(string: "http://localhost:1420/")!
        webView.load(URLRequest(url: appUrl))
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "windowAction", let action = message.body as? String else { return }
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            switch action {
            case "close":
                NSApp.terminate(nil)
            case "minimize":
                self.window.miniaturize(nil)
            case "maximize":
                self.window.zoom(nil)
            default:
                break
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
