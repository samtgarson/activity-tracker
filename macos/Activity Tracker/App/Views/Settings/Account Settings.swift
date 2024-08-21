//
//  GeneralSettings.swift
//  Activity Tracker
//
//  Created by Sam Garson on 14/08/2024.
//

import SwiftUI

struct AccountSettings: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        VStack(alignment: .center, spacing: 20) {
            switch appState.status {
            case .authenticated(let state):
                avatar
                Text(state.user.displayName).bold().font(.title2)
                Button { appState.logout() } label: {
                    Text("Log Out")
                }
            case .unauthenticated:
                VStack(alignment: .center, spacing: 10) {
                    Text("Get Started").font(.title).bold()
                    Text("""
                        Log in and connect your calendar \
                        to start tracking your activity.
                        """
                    ).multilineTextAlignment(.center)
                }.frame(width: 230)
                LoginButton()
            }
        }
    }

    private var pictureSize: CGFloat = 120

    private var picture: URL? {
        guard case .authenticated(let state) = appState.status,
              let picture = state.user.picture else {
            return nil
        }

        return URL(string: picture)
    }

    private var avatar: some View {
        AsyncImage(url: picture) { image in
            image.resizable().scaledToFill()
        } placeholder: {
            ProgressView()
        }
        .cornerRadius(pictureSize)
        .frame(width: pictureSize, height: pictureSize)
    }

}

#Preview {
    GeneralSettings()
        .frame(width: 500, height: 500)
        .environmentObject(previewAppState)
}
