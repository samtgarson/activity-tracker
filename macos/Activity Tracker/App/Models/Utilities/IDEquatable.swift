//
//  IDEquatable.swift
//  Activity Tracker
//
//  Created by Sam Garson on 27/08/2024.
//

import Foundation

protocol IDEquatable: Equatable, Identifiable {
    var id: UUID { get set }
}

extension IDEquatable {
    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.id == rhs.id
    }
}
