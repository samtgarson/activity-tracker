//
//  GeneralSettings.swift
//  Activity Tracker
//
//  Created by Sam Garson on 14/08/2024.
//

import SwiftUI
import LaunchAtLogin
import SwiftData
import ActivityTrackerAPIClient

struct CalendarSettings: View {
    @EnvironmentObject var currentUser: CurrentUser
    @Query var accounts: [Account]

    var body: some View {
        Form {
            Section {
                connectCalendarSection
            }.padding(.all, 10)
            ForEach(Provider.allCases, id: \.rawValue) { provider in
                if let accounts = groupedAccounts[provider] {
                    Section(content: {
                        ForEach(accounts) { account in
                            HStack(spacing: 10) {
                                ProviderLogo(provider: account.provider, size: 25)
                                Text(account.email)
                                if account.active {
                                    Text("Primary Account").foregroundStyle(.gray)
                                }
                                Spacer().frame(maxWidth: .infinity)
                                Button(role: .destructive, action: {}) {
                                    Image(systemName: "trash")
                                }.buttonStyle(.borderless)
                            }.frame(maxWidth: .infinity).padding(.all, 10)
                        }
                    }, header: {
                        Text(provider.title)
                    })
                }
            }
        }
        .formStyle(.grouped)
    }

    private var groupedAccounts: [Provider: [Account]] {
        return Dictionary(grouping: accounts, by: \.provider)
    }

    private var connectCalendarSection: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle().fill(.clear).stroke(.gray.opacity(0.25)).frame(width: 25, height: 25)
                Image(systemName: "plus")
            }
            Text("Connect new calendar")
            Spacer().frame(maxWidth: .infinity)
            LoginButton(content: {
                Text("Connect")
            })
        }
    }

    private func handleConnectedAccount(_ token: AuthToken) async throws {
        let data = try await token.apiClient.getCurrentUser()
        let accounts = data.accounts.map { Account(from: $0) }
        try? Account.create(accounts)
    }
}

#Preview {
    CalendarSettings()
        .frame(width: 700, height: 500)
        .environmentObject(PreviewAppState.authed().currentUser!)
}
