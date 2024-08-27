//
//  Provider.swift
//  Activity Tracker
//
//  Created by Sam Garson on 27/08/2024.
//

import Foundation

enum Provider: String, CaseIterable, Codable {
    case google

    var title: String {
        switch self {
        case .google:
            "Google Calendar"
        }
    }
}
