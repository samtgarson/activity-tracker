//
//  User.swift
//  Activity Tracker
//
//  Created by Sam Garson on 13/08/2024.
//

import Foundation
import ActivityTrackerAPIClient

class CurrentUser: Codable, ObservableObject, IDEquatable {
    var id: UUID
    var createdAt: Date
    var givenName: String
    var familyName: String
    var displayName: String
    var picture: String?

    init(
        id: UUID,
        createdAt: Date,
        givenName: String,
        familyName: String,
        displayName: String,
        picture: String? = nil
    ) {
        self.id = id
        self.createdAt = createdAt
        self.givenName = givenName
        self.familyName = familyName
        self.displayName = displayName
        self.picture = picture
    }

    init(from data: ActivityTrackerClient.User) {
        self.id = UUID(uuidString: data.id)!
        self.createdAt = parseDate(data.createdAt) ?? Date.now
        self.givenName = data.givenName
        self.familyName = data.familyName
        self.displayName = data.displayName
        self.picture = data.picture
    }
}
