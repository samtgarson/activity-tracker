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
        VStack(alignment: .center, spacing: .sm) {
            switch appState.status {
            case .authenticated(_, let user):
                avatar
                Text(user.displayName).bold().font(.title2)
                Button { appState.logout() } label: {
                    Text("Log Out")
                }.buttonStyle(.primary)
            case .unauthenticated:
                VStack(alignment: .center, spacing: .xs) {
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
        guard case .authenticated(_, let user) = appState.status,
              let picture = user.picture else {
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
    AccountSettings()
        .frame(width: 500, height: 500)
        .environmentObject(PreviewAppState.unauthed())
}
