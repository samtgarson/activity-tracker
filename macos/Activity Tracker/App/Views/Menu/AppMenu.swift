//
//  AppMenu.swift
//  Activity Tracker
//
//  Created by Sam Garson on 13/08/2024.
//

import SwiftUI
import ActivityTrackerAPIClient

struct AppMenu: View {
    var body: some View {
        Text("No events today")

        Divider()

        SettingsLink(label: { Text("Settings...") })
            .keyboardShortcut(",")
        Button("Quit Activity Tracker completely") { NSApplication.shared.terminate(nil) }
            .keyboardShortcut("q")
    }
}

#Preview {
    AppMenu()
}
