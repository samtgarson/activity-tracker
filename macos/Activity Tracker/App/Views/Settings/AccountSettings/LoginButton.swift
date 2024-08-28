//
//  LoginButton.swift
//  Activity Tracker
//
//  Created by Sam Garson on 19/08/2024.
//

import SwiftUI
import BetterSafariView
import ActivityTrackerAPIClient

struct LoginButton<Content: View>: View {
    var content: () -> Content

    init(
        @ViewBuilder content: @escaping () -> Content = { Text("Log In") }
    ) {
        self.content = content
    }

    @EnvironmentObject var appState: AppState
    @State private var loading = false
    @State private var error: String?
    @State private var buttonState: LoginButtonState?

    var body: some View {
        VStack(spacing: 10) {
            Button(action: startSession, label: { content() })
                .isLoading(loading)
                .buttonStyle(.primary)
        }.webAuthenticationSession(item: $buttonState) { item in
            WebAuthenticationSession(
                url: item.url(for: .google),
                callbackURLScheme: Config.urlScheme,
                completionHandler: handleCallback
            )
            .prefersEphemeralWebBrowserSession(false)
        }.alert("Unable to authenticate", isPresented: showError) {
            Button("OK", role: .cancel) { }
        }
    }

    private var showError: Binding<Bool> {
        Binding(
            get: { self.error != nil },
            set: { self.error = $0 ? "" : nil }
        )
    }

    private func startSession() {
        self.loading = true
        Task {
            self.buttonState = await LoginButtonState.fresh(appState)
        }
    }

    private func handleCallback(callbackURL: URL?, error: (any Error)?) {
        if let error = error {
            self.error = error.localizedDescription
            self.loading = false
        } else if let url = callbackURL, let token = parseCallbackUrl(url.absoluteString) {
            Task {
                await appState.login(token: token)
                self.loading = false
            }
        }
    }

    private func parseCallbackUrl(_ url: String) -> AuthToken? {
        let queryItems = URLComponents(string: url)?.queryItems
        let accessToken = queryItems?.filter({ $0.name == "accessToken" }).first?.value
        let refreshToken = queryItems?.filter({ $0.name == "refreshToken" }).first?.value
        let refreshExpiresStr = queryItems?.filter({ $0.name == "refreshTokenExpiresAt" }).first?.value

        guard
            let accessToken = accessToken,
            let refreshToken = refreshToken,
            let refreshExpiresStr = refreshExpiresStr
        else { return nil }

        let token = AuthToken(access: accessToken, refresh: refreshToken, expiry: refreshExpiresStr)
        token.save()
        return token
    }
}

#Preview {
    LoginButton()
        .frame(width: 400, height: 200)
        .environmentObject(PreviewAppState.authed())
}

private struct LoginButtonState: Identifiable {
    let id = UUID()
    var token: AuthToken?

    static func fresh(_ appState: AppState) async -> LoginButtonState {
        guard let token = await appState.token else {
            return LoginButtonState()
        }

        try? await token.refreshTokens()
        return LoginButtonState(token: token)
    }

    func url(for provider: ActivityTrackerClient.Provider) -> URL {
        var url = Config.apiUrl
            .appendingPathComponent("/auth/login/\(provider.rawValue)")
            .appending(queryItems: [.init(
                name: "external",
                value: "true"
            )])

        if let token = token {
            url.append(queryItems: [
                .init(name: "token", value: token.access)
            ])
        }

        return url
    }
}
