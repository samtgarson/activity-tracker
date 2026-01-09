//
//  FloatingPanel.swift
//  Activity Tracker
//
//  Created by Sam Garson on 01/09/2024.
//

import SwiftUI

/// A floating panel component
///
/// Uses AppKit's NSPanel class, a subclass of NSWindow. that has panel properties such as:
/// - Floating on top of all other windows.
/// - Staying in memory after it's closed.
/// - Hiding when the application isn't active.
///
/// https://cindori.com/developer/floating-panel
///
class FloatingPanel<Content: View>: NSPanel {
    init(contentRect: NSRect,
         backing: NSWindow.BackingStoreType = .buffered,
         defer flag: Bool = false,
         view: () -> Content
    ) {
        /// Init the window as usual
        super.init(contentRect: contentRect,
                   styleMask: [.nonactivatingPanel, .titled, .resizable, .closable, .fullSizeContentView],
                   backing: backing,
                   defer: flag)

        /// Allow the panel to be on top of other windows
        isFloatingPanel = true
        level = .floating

        /// Allow the pannel to be overlaid in a fullscreen space
        collectionBehavior.insert(.fullScreenAuxiliary)

        /// Don't show a window title, even if it's set
        titleVisibility = .hidden
        titlebarAppearsTransparent = true

        /// Since there is no title bar make the window moveable by dragging on the background
        isMovableByWindowBackground = true

        /// Hide when unfocused
        hidesOnDeactivate = true

        /// Hide all traffic light buttons
        standardWindowButton(.closeButton)?.isHidden = true
        standardWindowButton(.miniaturizeButton)?.isHidden = true
        standardWindowButton(.zoomButton)?.isHidden = true

        /// Sets animations accordingly
        animationBehavior = .utilityWindow

        /// Set the content view.
        /// The safe area is ignored because the title bar still interferes with the geometry
        contentView = NSHostingView(rootView: view()
            .ignoresSafeArea()
            .environment(\.floatingPanel, self))
    }

    /// Close automatically when out of focus, e.g. outside click
    override func resignMain() {
        super.resignMain()
        close()
    }

    /// `canBecomeKey` and `canBecomeMain` are both required so that text inputs inside the panel can receive focus
    override var canBecomeKey: Bool {
        return true
    }

    override var canBecomeMain: Bool {
        return true
    }

    /// Present the panel and make it the key window
    func present() {
        orderFront(nil)
        makeKey()
    }
}

private struct FloatingPanelKey: EnvironmentKey {
    static let defaultValue: NSPanel? = nil
}

extension EnvironmentValues {
    var floatingPanel: NSPanel? {
        get { self[FloatingPanelKey.self] }
        set { self[FloatingPanelKey.self] = newValue }
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State var show: Bool = false

        var body: some View {
            VStack(spacing: 16) {
                Button(action: { show.toggle() }, label: {
                    Text("Button")
                }).buttonStyle(.primary)
                Text("Showing: \(show)")
            }
            .frame(width: 300, height: 240)
            .floatingPanel(isPresented: $show) {
                Text("Hello")
            }
        }
    }

    return PreviewWrapper()
}
