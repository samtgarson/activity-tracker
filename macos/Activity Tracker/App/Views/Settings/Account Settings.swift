//
//  GeneralSettings.swift
//  Activity Tracker
//
//  Created by Sam Garson on 14/08/2024.
//

import SwiftUI

struct AccountSettings: View {

    var body: some View {
        VStack(alignment: .center) {
            LoginButton(onSuccess: { token in debugPrint(token) }, onError: { error in debugPrint("Error!", error) })
        }
    }

}

#Preview {
    GeneralSettings()
}
