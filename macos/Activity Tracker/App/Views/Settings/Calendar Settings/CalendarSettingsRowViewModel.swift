//
//  CalendarSettingsRowViewModel.swift
//  Activity Tracker
//
//  Created by Sam Garson on 28/08/2024.
//

import Foundation
import ActivityTrackerAPIClient
import SwiftUI

class CalendarSettingsRowViewModel: ObservableObject {
    let account: Account
    let client: ActivityTrackerClient
    @Published var loading = false
    @Published var showError = false
    @Published var showConfirmation = false

    init(account: Account) {
        self.account = account

        guard let token = AuthToken.load() else {
            fatalError("Unauthenticated")
        }
        self.client = token.apiClient
    }

    func disconnect() async {
        guard showConfirmation else {
            showConfirmation = true
            return
        }

        loading = true
        do {
            try await client.disconnectAccount(id: account.id)
            try withAnimation {
                try account.delete()
            }
        } catch {
            debugPrint(error)
            showError = true
        }
        loading = false
    }

}
