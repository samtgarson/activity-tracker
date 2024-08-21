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

    static func from(data: ActivityTrackerClient.User) -> CurrentUser {
        return CurrentUser(
            id: data.id,
            createdAt: parseDate(data.createdAt) ?? Date.now,
            givenName: data.givenName,
            familyName: data.familyName,
            displayName: data.displayName,
            picture: data.picture
        )
    }

    static func loadStored() -> CurrentUser? {
        let savedUser = UserDefaults.standard.object(forKey: storageKey) as? Data
        guard let savedUser = savedUser else { return nil }

        let decoder = JSONDecoder()
        let loadedUser = try? decoder.decode(CurrentUser.self, from: savedUser)
        guard let loadedUser = loadedUser else { return nil }

        return loadedUser
    }

    static func clearStored() {
        UserDefaults.standard.removeObject(forKey: storageKey)
    }

    func save() {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(self) {
            UserDefaults.standard.setValue(encoded, forKey: storageKey)
        }
    }
}
