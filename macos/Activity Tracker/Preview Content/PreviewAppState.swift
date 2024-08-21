//
//  AppState.swift
//  Activity Tracker
//
//  Created by Sam Garson on 21/08/2024.
//

import Foundation

let previewAuthedState = AppState.AuthenticatedState(
    token: AuthToken(access: "access", refresh: "refresh", expiry: "2030-01-01T12:00:00.000Z"),
    user: .init(
        id: "id",
        createdAt: Date.now,
        givenName: "Sam",
        familyName: "Garson",
        displayName: "Sam Garson",
        picture: "https://avatars.githubusercontent.com/u/6242344?v=4"
    )
)

let previewAppState = AppState(
    status: .authenticated(
        previewAuthedState
    )
)
