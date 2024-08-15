//
//  Settings.swift
//  Activity Tracker
//
//  Created by Samuel Garson on 14/08/2024.
//

import SwiftUI

struct SettingsView: View {
    private var tabs: [SettingsTab] = [.general, .account]

    var body: some View {
        TabView {
            ForEach(tabs, id: \.title) { tab in
                tab.view.tabItem {
                    Label(tab.title, systemImage: tab.icon)
                }
            }
        }
        .background(BlurredBackground().ignoresSafeArea())
    }
}

#Preview {
    SettingsView()
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

    var view: some View {
        switch self {
        case .general:
            return Text("General Tab")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .account:
            return Text("Account Tab")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}
