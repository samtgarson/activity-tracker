//
//  GeneralSettings.swift
//  Activity Tracker
//
//  Created by Sam Garson on 14/08/2024.
//

import SwiftUI
import LaunchAtLogin

struct GeneralSettings: View {

    var body: some View {
        VStack(alignment: .center) {
            Form {
                LaunchAtLogin.Toggle().padding()
            }
            .formStyle(.grouped)
        }
    }

}

#Preview {
    GeneralSettings().frame(width: 700, height: 500)
}
