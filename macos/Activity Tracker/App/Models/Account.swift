//
//  Account.swift
//  Activity Tracker
//
//  Created by Sam Garson on 25/08/2024.
//

import Foundation
import ActivityTrackerAPIClient
import SwiftData

@Model
final class Account: Identifiable, DatabaseModel {
    @Attribute(.unique) var id: UUID
    var provider: Provider
    var calendarId: String?
    var active: Bool
    var email: String

    init(id: UUID, provider: Provider, calendarId: String? = nil, active: Bool, email: String) {
        self.id = id
        self.provider = provider
        self.calendarId = calendarId
        self.active = active
        self.email = email
    }

    init(from data: ActivityTrackerClient.Account) {
        self.id = UUID(uuidString: data.id)!
        self.provider = Provider(rawValue: data.provider.rawValue)!
        self.calendarId = data.calendarId
        self.active = data.active
        self.email = data.email
    }

    var title: String {
        switch provider {
        case .google:
            "Google Calendar"
        }
    }
}
