//
//  AppState.swift
//  Activity Tracker
//
//  Created by Sam Garson on 21/08/2024.
//

import Foundation

struct PreviewAppState {
    enum Case {
        case unauthenticated
        case authenticated(Int)
    }

    static func unauthed() -> AppState {
        PreviewAppState(usecase: .unauthenticated).state
    }

    static func authed() -> AppState {
        PreviewAppState(usecase: .authenticated(1)).state
    }

    var state: AppState {
        AppState(status: status)
    }

    private var usecase: Case

    private var user: CurrentUser? {
        switch usecase {
        case .unauthenticated:
            nil
        case .authenticated:
                .init(
                    id: "id",
                    createdAt: Date.now,
                    givenName: "Sam",
                    familyName: "Garson",
                    displayName: "Sam Garson",
                    picture: "https://avatars.githubusercontent.com/u/6242344?v=4",
                    accounts: []
                )
        }
    }

    private var token: AuthToken? {
        switch usecase {
        case .unauthenticated:
            nil
        case .authenticated:
                .init(access: "access", refresh: "refresh", expiry: "2030-01-01T12:00:00.000Z")
        }
    }

    private var status: AppState.AppStatus {
        guard let user = user, let token = token else { return .unauthenticated }
        return .authenticated(.init(token: token, user: user))
    }
}

let previewAuthedState = AppState.AuthenticatedState(
    token: .init(access: "access", refresh: "refresh", expiry: "2030-01-01T12:00:00.000Z"),
    user: .init(
        id: "id",
        createdAt: Date.now,
        givenName: "Sam",
        familyName: "Garson",
        displayName: "Sam Garson",
        picture: "https://avatars.githubusercontent.com/u/6242344?v=4",
        accounts: []
    )
)

/// Deprecated
let previewAppState = AppState(
    status: .authenticated(
        previewAuthedState
    )
)
