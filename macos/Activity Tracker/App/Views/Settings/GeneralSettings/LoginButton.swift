//
//  LoginButton.swift
//  Activity Tracker
//
//  Created by Sam Garson on 19/08/2024.
//

import SwiftUI
import BetterSafariView
import ActivityTrackerAPIClient

struct LoginButton: View {
    @State private var startingWebAuthSession = false
    let onSuccess: (_ token: AuthToken) -> Void
    let onError: (_ error: String) -> Void

    var body: some View {
        Button(action: startSession) {
            Text("Log In")
        }.webAuthenticationSession(isPresented: $startingWebAuthSession) {
            WebAuthenticationSession(
                url: url(for: .google),
                callbackURLScheme: Config.urlScheme,
                completionHandler: handleCallback
            )
            .prefersEphemeralWebBrowserSession(false)
        }
    }

    private func startSession() {
        self.startingWebAuthSession = true
    }

    private func url(for provider: ActivityTrackerClient.Provider) -> URL {
        return Config.apiUrl
            .appendingPathComponent("/auth/login/\(provider.rawValue)")
            .appending(queryItems: [.init(
                name: "external",
                value: "true"
            )]
            )
    }

    private func handleCallback(callbackURL: URL?, error: (any Error)?) {
        if let error = error {
            onError(error.localizedDescription)
        } else if let url = callbackURL, let token = parseCallbackUrl(url.absoluteString) {
            onSuccess(token)
        } else {
            debugPrint("Neither callbackUrl or error")
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
    LoginButton(onSuccess: { token in debugPrint(token) }, onError: { error in debugPrint("Error!", error) })
}
