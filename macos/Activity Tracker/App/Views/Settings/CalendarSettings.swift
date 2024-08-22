//
//  GeneralSettings.swift
//  Activity Tracker
//
//  Created by Sam Garson on 14/08/2024.
//

import SwiftUI
import LaunchAtLogin

struct CalendarSettings: View {
    var body: some View {
        VStack(alignment: .center) {
            Form {
            }
            .formStyle(.grouped)
            .frame(maxWidth: 350)
        }
    }

}

#Preview {
    GeneralSettings().frame(width: 700, height: 500)
}
