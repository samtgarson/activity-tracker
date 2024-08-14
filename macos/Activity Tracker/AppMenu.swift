//
//  AppMenu.swift
//  Activity Tracker
//
//  Created by Samuel Garson on 13/08/2024.
//

import SwiftUI

struct AppMenu: View {
    var body: some View {
        Text("No events today")

        Divider()

        Button("Quit Activity Tracker completely") { NSApplication.shared.terminate(nil) }
    }
}

#Preview {
    AppMenu()
}
