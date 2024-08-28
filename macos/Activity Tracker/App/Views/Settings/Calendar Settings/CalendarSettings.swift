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
    @Query var accounts: [Account]

    var body: some View {
        Form {
            Section {
                connectCalendarSection
            }.padding(.xs)
            ForEach(Provider.allCases, id: \.rawValue) { provider in
                if let accounts = groupedAccounts[provider] {
                    Section(content: {
                        ForEach(accounts) { account in
                            AccountRow(account: account)
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
        HStack(spacing: .xs) {
            ZStack {
                Circle().fill(.clear).stroke(.gray.opacity(0.25)).frame(width: .sm, height: .sm)
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

    private struct AccountRow: View {
        var account: Account
        @ObservedObject var state: CalendarSettingsRowViewModel

        init(account: Account) {
            self.account = account
            self.state = CalendarSettingsRowViewModel(account: account)
        }

        var body: some View {
            HStack(spacing: .xs) {
                ProviderLogo(provider: account.provider, size: .sm)
                Text(account.email)
                if account.active {
                    Text("Primary Account").foregroundStyle(.gray)
                }
                Spacer().frame(maxWidth: .infinity)
                if !account.active {
                    Button(role: .destructive, action: state.disconnect, label: {
                        if state.loading {
                            ProgressView().controlSize(.small)
                        } else {
                            Image(systemName: "trash")
                        }
                    }).buttonStyle(.borderless)
                }
            }
            .frame(maxWidth: .infinity).padding(.xs)
            .alert("Unable to disconnect", isPresented: $state.showError) {
                Button("OK", role: .cancel) { }
            }
            .confirmationDialog(
                "Disconnect \(account.email)?",
                isPresented: $state.showConfirmation
            ) {
                Button(action: state.disconnect, label: {
                    Text("Yes, disconnect")
                })
            } message: {
                Text("You can reconnect it later.")
            }
        }
    }
}

#Preview {
    CalendarSettings()
        .frame(width: 700, height: 500)
        .environmentObject(PreviewAppState.authed())
        .modelContainer(Database
                            .testInstance(with: [
                                Account(id: UUID(), provider: .google, active: false, email: "sam@samgarson.com"),
                                Account(id: UUID(), provider: .google, active: true, email: "samtgarson@gmail.com")
                            ])
                            .container)
}
