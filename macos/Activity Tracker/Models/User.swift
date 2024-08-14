//
//  User.swift
//  Activity Tracker
//
//  Created by Samuel Garson on 13/08/2024.
//

import Foundation
import SwiftData

@Model
class User {
  var id: String
  var createdAt: String
  var givenName: String
  var familyName: String
  var displayName: String
  var picture: String?

    init(id: String, createdAt: String, givenName: String, familyName: String, displayName: String, picture: String? = nil) {
        self.id = id
        self.createdAt = createdAt
        self.givenName = givenName
        self.familyName = familyName
        self.displayName = displayName
        self.picture = picture
    }
}
