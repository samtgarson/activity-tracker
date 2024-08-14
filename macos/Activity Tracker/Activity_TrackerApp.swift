//
//  Activity_TrackerApp.swift
//  Activity Tracker
//
//  Created by Samuel Garson on 13/08/2024.
//

import SwiftUI
import SwiftData

@main
struct ActivityTrackerApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            User.self
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        MenuBarExtra("ActivityTracker", systemImage: "hammer") {
            AppMenu()
        }.modelContainer(sharedModelContainer)
    }
}
