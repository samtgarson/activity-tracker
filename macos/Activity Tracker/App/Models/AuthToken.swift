//
//  AuthToken.swift
//  Activity Tracker
//
//  Created by Sam Garson on 19/08/2024.
//

import Foundation
import JWTDecode
import ActivityTrackerAPIClient

class AuthToken {
    var access: String
    var refresh: String
    var expiry: Date?

    init(access: String, refresh: String, expiry: String) {
        self.access = access
        self.refresh = refresh
        self.expiry = parseDate(expiry)
    }

    static func load () -> AuthToken? {
        let access = KeychainStorage.instance.get(.accessToken)
        let refresh = KeychainStorage.instance.get(.refreshToken)
        let expiry = KeychainStorage.instance.get(.refreshTokenExpiry)
        guard let access = access, let refresh = refresh, let expiry = expiry else { return nil }

        let token = AuthToken(access: access, refresh: refresh, expiry: expiry)

        return token
    }

    var apiClient: ActivityTrackerClient {
        return ActivityTrackerClient(apiUrl: Config.apiUrl, token: access)
    }

    func save() {
        KeychainStorage.instance.set(.accessToken, value: access)
        KeychainStorage.instance.set(.refreshToken, value: refresh)
        if let expiry = expiry {
            KeychainStorage.instance.set(.refreshTokenExpiry, value: expiry.ISO8601Format())
        }
    }

    func clear () {
        KeychainStorage.instance.clearAll()
    }

    var accessTokenExpired: Bool {
        guard let jwt = try? decode(jwt: access) else { return false }
        return jwt.expired
    }
}
