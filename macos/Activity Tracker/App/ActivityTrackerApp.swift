//
//  Activity_TrackerApp.swift
//  Activity Tracker
//
//  Created by Sam Garson on 13/08/2024.
//

import SwiftUI
import SwiftData

@main
struct ActivityTrackerApp: App {
    @StateObject var appState = AppState()

    var body: some Scene {
        MenuBarExtra {
            AppMenu()
        } label: {
            Image(systemName: "calendar.badge.clock")
        }
        .modelContainer(Database.instance.container)

        Settings {
            SettingsView()
                .environmentObject(appState)
                .modelContainer(Database.instance.container)
        }
    }
}
