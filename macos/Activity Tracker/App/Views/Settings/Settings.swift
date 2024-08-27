//
//  Settings.swift
//  Activity Tracker
//
//  Created by Samuel Garson on 14/08/2024.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    private let topTabs: [SettingsTab] = [.general, .calendars]
    private let bottomTabs: [SettingsTab] = [.account]
    @State var selectedTab: SettingsTab = .general

    var body: some View {
        NavigationSplitView {
            List(topTabs, selection: $selectedTab) { tabItem($0) }
                .frame(maxHeight: .infinity)
                .disabled(!appState.authenticated)
                .opacity(appState.authenticated ? 1 : 0.5)
            Spacer()
            List(bottomTabs, selection: $selectedTab) { tabItem($0) }
                .frame(height: 40)
                .scrollDisabled(true)
        } detail: {
            selectedView
        }
        .toolbar {
            Text("")
        }
        .task {
            let window = NSApplication.shared.windows.first(where: \.canBecomeMain)
            window?.toolbarStyle = .unified
            window?.toolbar?.displayMode = .iconOnly
        }
        .navigationTitle("Settings")
        .onAppear { if !appState.authenticated { selectedTab = .account } }
    }

    @ViewBuilder
    private var selectedView: some View {
        let view = selectedTab.view
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        if let user = appState.currentUser {
            view.environmentObject(user)
        } else {
            view
        }
    }

    private func tabItem(_ tab: SettingsTab) -> some View {
        return HStack {
            ZStack {
                RoundedRectangle(cornerRadius: 5)
                    .frame(width: 23, height: 23)
                    .shadow(radius: 0.5)
                    .foregroundColor(tab.color)
                Image(systemName: tab.icon)
                    .foregroundColor(.white)
                    .shadow(radius: 4)
            }
            Text(tab.title)
        }
    }
}

#Preview {
    SettingsView()
        .frame(width: 700, height: 500)
        .environmentObject(PreviewAppState.authed())

}

enum SettingsTab: Equatable, Hashable, Identifiable {
    var id: Self { return self }

    case general
    case account
    case calendars

    var title: String {
        switch self {
        case .general:
            return "General"
        case .account:
            return "Account"
        case .calendars:
            return "Calendars"
        }
    }

    var icon: String {
        switch self {
        case .general:
            return "gearshape"
        case .account:
            return "person.crop.circle"
        case .calendars:
            return "calendar"
        }
    }

    var color: Color {
        switch self {
        case .general:
            return .gray
        case .account:
            return .pink
        case .calendars:
            return .gray
        }
    }

    @ViewBuilder
    var view: some View {
        switch self {
        case .general:
            GeneralSettings()
        case .account:
            AccountSettings()
        case .calendars:
            CalendarSettings()
        }
    }
}
