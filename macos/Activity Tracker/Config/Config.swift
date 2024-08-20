//
//  Config.swift
//  Activity Tracker
//
//  Created by Sam Garson on 15/08/2024.
//

import Foundation

final class Config {
    static let apiUrl: URL = URL(string: getVar(name: "API URL"))!
    static let urlScheme = "activity-tracker"
    static let identifier = "com.samtgarson.\(urlScheme)"

    private static func getVar(name: String) -> String {
        if let value = Bundle.main.infoDictionary![name] as? String {
            return value.replacingOccurrences(of: "||", with: "//")
        } else {
            return ""
        }
    }

    private init() {}
}
