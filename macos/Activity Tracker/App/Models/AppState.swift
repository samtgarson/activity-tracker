//
//  AppState.swift
//  Activity Tracker
//
//  Created by Sam Garson on 20/08/2024.
//

import Foundation
import ActivityTrackerAPIClient
import SwiftUI

@MainActor
class AppState: ObservableObject {
    enum AppStatus {
        case authenticated(AuthToken, CurrentUser)
        case unauthenticated
    }

    @Published private(set) var status: AppStatus = .unauthenticated

    init(status: AppStatus = .unauthenticated) {
        self.status = status

        Task {
            try? await setup()
        }
    }

    var authenticated: Bool {
        switch status {
        case .authenticated:
            return true
        default:
            return false
        }
    }

    var currentUser: CurrentUser? {
        guard case .authenticated(_, let user) = status else {
            return nil
        }

        return user
    }

    var token: AuthToken? {
        guard case .authenticated(let token, _) = status else {
            return nil
        }

        return token
    }

    /// Receives an AuthToken and authenticates with it
    func login(token: AuthToken) async {
        do {
            let user = try await loadUser(token: token)
            self.status = .authenticated(token, user)
        } catch {
            debugPrint("ERROR: \(error)")
        }
    }

    func logout() {
        guard case .authenticated(let token, _) = status else { return }

        Database.instance.reset()
        token.clear()
        status = .unauthenticated
    }

    /// Loads stored token from Keychain and sets up the App State instance
    func setup() async throws {
        guard var token = AuthToken.load() else { return }

        try await token.refreshTokens()
        await login(token: token)
    }

    var api: ActivityTrackerClient? { token?.apiClient }

    private func loadUser(token: AuthToken) async throws -> CurrentUser {
        let data = try await token.apiClient.getCurrentUser()
        let user = CurrentUser(from: data)

        if let existingUser = currentUser, existingUser != user {
            debugPrint("Received user mismatch during authentication. Logging out.")
            logout()
        }

        let accounts = data.accounts.map { Account(from: $0) }
        try? Account.create(accounts)

        return user
    }
}
