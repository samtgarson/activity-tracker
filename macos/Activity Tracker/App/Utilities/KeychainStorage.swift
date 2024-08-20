//
//  KeychainStorage.swift
//  Activity Tracker
//
//  Created by Sam Garson on 19/08/2024.
//

import SwiftUI
import KeychainAccess

class KeychainStorage {
    static let instance = KeychainStorage()

    enum KeychainField: String {
        case accessToken
        case refreshToken
        case refreshTokenExpiry
    }

    private init() {}

    private let client = Keychain(service: Config.identifier).label("Activity Tracker").accessibility(.afterFirstUnlock)

    func get(_ field: KeychainField) -> String? {
        return try? client.get(field.rawValue)
    }


    func set(_ field: KeychainField, value: String) {
        try? client.set(value, key: field.rawValue)
    }
}
