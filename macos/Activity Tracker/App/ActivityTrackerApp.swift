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
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    @StateObject var appState = AppState()
    @StateObject var uiState = UIState()

    init() {
    }

    var body: some Scene {
        MenuBarExtra {
            AppMenu()
                .environmentObject(uiState)
        } label: {
            Image(systemName: "calendar.badge.clock")
        }
        .menuBarExtraStyle(.window)
        .modelContainer(Database.instance.container)

        Settings {
            SettingsView()
                .environmentObject(appState)
                .modelContainer(Database.instance.container)
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    func application(_ application: NSApplication, open urls: [URL]) {
        debugPrint(application)
    }
}
