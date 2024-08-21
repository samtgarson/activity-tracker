//
//  Settings.swift
//  Activity Tracker
//
//  Created by Samuel Garson on 14/08/2024.
//

import SwiftUI

struct SettingsView: View {
    private let tabs: [SettingsTab] = [.general, .account]

    var body: some View {
        TabView {
            ForEach(tabs, id: \.title) { tab in
                tab.view
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .tabItem { Label(tab.title, systemImage: tab.icon) }
            }
        }
        .background(BlurredBackground().ignoresSafeArea())
    }
}

#Preview {
    SettingsView()
        .frame(width: 500, height: 500)

}

enum SettingsTab: Equatable, Hashable {
    case general
    case account

    var title: String {
        switch self {
        case .general:
            return "General"
        case .account:
            return "Account"
        }
    }

    var icon: String {
        switch self {
        case .general:
            return "gearshape"
        case .account:
            return "person.crop.circle"
        }
    }

    @ViewBuilder
    var view: some View {
        switch self {
        case .general:
            GeneralSettings()
        case .account:
            AccountSettings()
        }
    }
}
