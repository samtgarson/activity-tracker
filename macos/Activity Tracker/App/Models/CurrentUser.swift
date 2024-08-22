//
//  User.swift
//  Activity Tracker
//
//  Created by Sam Garson on 13/08/2024.
//

import Foundation
import ActivityTrackerAPIClient

private let storageKey = "CurrentUser"

struct CurrentUser: Codable {
    var id: String
    var createdAt: Date
    var givenName: String
    var familyName: String
    var displayName: String
    var picture: String?
    var accounts: [Account]

    static func from(data: ActivityTrackerClient.User) -> CurrentUser {
        return CurrentUser(
            id: data.id,
            createdAt: parseDate(data.createdAt) ?? Date.now,
            givenName: data.givenName,
            familyName: data.familyName,
            displayName: data.displayName,
            picture: data.picture,
            accounts: data.accounts.map { Account.from(data: $0) }
        )
    }

    struct Account: Codable {
        var id: String
        var provider: ActivityTrackerClient.Provider
        var calendarId: String?
        var active: Bool

        static func from(data: ActivityTrackerClient.Account) -> Account {
            return Account(
                id: data.id,
                provider: data.provider,
                calendarId: data.calendarId,
                active: data.active
            )
        }
    }
}
