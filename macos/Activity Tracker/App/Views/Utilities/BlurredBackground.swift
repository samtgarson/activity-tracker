//
//  BlurredBackground.swift
//  Activity Tracker
//
//  Created by Samuel Garson on 14/08/2024.
//

import Foundation
import SwiftUI

struct BlurredBackground: NSViewRepresentable {
    func makeNSView(context: Context) -> NSVisualEffectView {
        let effectView = NSVisualEffectView()
        effectView.state = .active
        return effectView
    }

    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
    }
}
