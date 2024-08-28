//
//  AsyncButtonExtension.swift
//  Activity Tracker
//
//  Created by Sam Garson on 28/08/2024.
//

import Foundation
import SwiftUI

extension Button {
    public init(action: @escaping () async -> Void, @ViewBuilder label: () -> Label) {
        self.init(action: {
            Task { await action() }
        }, label: label)
    }

    public init(role: ButtonRole, action: @escaping () async -> Void, @ViewBuilder label: () -> Label) {
        self.init(role: role, action: {
            Task { await action() }
        }, label: label)
    }
}

struct AsyncButton<Label>: View where Label: View {
    @State var loading = false
    var label: Label
    var action: () async throws -> Void

    public init(action: @escaping () async throws -> Void, @ViewBuilder label: () -> Label) {
        self.label = label()
        self.action = action
    }

    var body: some View {
        Button(action: {
            self.loading = true
            try? await action()
            self.loading = false
        }, label: { label })
        .isLoading(loading)
    }
}

#Preview {
    VStack {
        AsyncButton(action: {
            try? await Task.sleep(nanoseconds: 1000000000)
        }, label: {
            Text("Sleep")
        }).buttonStyle(.primary)
    }.padding()
}
