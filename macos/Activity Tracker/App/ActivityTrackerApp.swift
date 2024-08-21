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
    let sharedModelContainer: ModelContainer = {
        let schema = Schema([])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    @StateObject var appState = AppState()

    var body: some Scene {
        MenuBarExtra("ActivityTracker", systemImage: "hammer") {
            AppMenu()
        }
        .modelContainer(sharedModelContainer)

        Settings {
            SettingsView().environmentObject(appState)
        }
    }
}
