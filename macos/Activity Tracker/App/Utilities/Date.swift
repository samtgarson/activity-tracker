//
//  Date.swift
//  Activity Tracker
//
//  Created by Sam Garson on 21/08/2024.
//

import Foundation

func parseDate(_ dateStr: String?) -> Date? {
    guard let dateStr = dateStr else { return nil }
    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions.insert(.withFractionalSeconds)
    return dateFormatter.date(from: dateStr)
}
