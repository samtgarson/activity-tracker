//
//  AppState.swift
//  Activity Tracker
//
//  Created by Sam Garson on 20/08/2024.
//

import Foundation
import ActivityTrackerAPIClient
import SwiftUI

class AppState: ObservableObject {
    enum AppStatus {
        case authenticated(AuthenticatedState)
        case unauthenticated
    }

    @Published private(set) var status: AppStatus = .unauthenticated

    init(status: AppStatus = .unauthenticated) {
        self.status = status

        Task {
            try? await load()
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

    func login(token: AuthToken) async {
        do {
            let user = try await loadUser(token: token)

            let state = AuthenticatedState(token: token, user: user)

            await MainActor.run {
                status = .authenticated(state)
            }
        } catch {
            debugPrint("ERROR: \(error)")
        }
    }

    func logout() {
        guard case .authenticated(let state) = status else {
            return
        }

        state.token.clear()
        status = .unauthenticated
    }

    func load() async throws {
        guard var token = AuthToken.load() else { return }

        token = try await refreshAccessToken(from: token)
        await login(token: token)
    }

    private func loadUser(token: AuthToken) async throws -> CurrentUser {
        let data = try await token.apiClient.getCurrentUser()
        return CurrentUser.from(data: data)
    }

    private func refreshAccessToken(from token: AuthToken) async throws -> AuthToken {
        guard token.accessTokenExpired else { return token }
        guard let newToken = try await token.apiClient.getAccessToken(with: token.refresh) else { return token }

        token.access = newToken
        token.save()
        return token
    }

    struct AuthenticatedState {
        let token: AuthToken
        let user: CurrentUser

        var api: ActivityTrackerClient { token.apiClient }
    }
}
