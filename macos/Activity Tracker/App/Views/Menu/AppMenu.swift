//
//  AppMenu.swift
//  Activity Tracker
//
//  Created by Sam Garson on 13/08/2024.
//

import SwiftUI
import ActivityTrackerAPIClient

struct AppMenu: View {
    @EnvironmentObject var uiState: UIState
    @State var win: NSWindow?

    var body: some View {
        Text("No events today")
        Button("Track an activity...") {}
        Divider()

        SettingsLink(label: { Image(systemName: "gear") })
            .keyboardShortcut(",")
    }

    //    private var delegate: NSWindowDelegate {
    //    }
}

#Preview {
    AppMenu()
}

/**
 hack to avoid crashes on window close, and remove the window from the
 NSApplication stack, ie: avoid leaking window objects
 */
private final class WindowDelegate: NSObject, NSWindowDelegate {
    func windowShouldClose(_ sender: NSWindow) -> Bool {
        NSApp.removeWindowsItem(sender)
        return true
    }

    deinit {
        NSLog("deallocated ...")
    }
}

public extension View {
    func openInNewWindow(_ introspect: @escaping (_ window: NSWindow) -> Void) {
        let windowDelegate = WindowDelegate()
//        let win = FloatingPanel(
//            contentRect: NSRect(x: 0, y: 0, width: 320, height: 320),
//            backing: .buffered,
//            defer: false
//        ) { self }
        let win = NSPanel(
                    contentRect: NSRect(x: 0, y: 0, width: 320, height: 320),
                    styleMask: [.fullSizeContentView, .borderless, .utilityWindow],
                    backing: .buffered,
                    defer: false
                )
        win.isReleasedWhenClosed = false
        win.title = "New Window"
        // who owns who :-)
        win.delegate = windowDelegate
//        win.contentView = NSHostingView(rootView: self)
        introspect(win)
        win.center()
        win.makeKeyAndOrderFront(nil)
    }
}
