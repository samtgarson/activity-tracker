//
//  Buttons.swift
//  Activity Tracker
//
//  Created by Sam Garson on 27/08/2024.
//

import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled
    @Environment(\.isLoading) var isLoading
    @State private var showLoading: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 10) {
            if showLoading { ProgressView().controlSize(.small) }
            configuration.label
        }
        .frame(minWidth: 65)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.foreground.opacity(0.1), in: RoundedRectangle(cornerRadius: 6))
        .opacity(opacity(configuration))
        .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
        .onChange(of: isLoading, initial: true) {
            withAnimation(.easeOut(duration: 0.1)) { showLoading = isLoading }
        }
    }

    private func opacity(_ configuration: Configuration) -> CGFloat {
        guard isEnabled && !showLoading else {
            return 0.5
        }

        return configuration.isPressed ? 0.7 : 1
    }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var primary: Self { Self() }
}

#Preview {
    struct PreviewWrapper: View {
        @State var loading: Bool = true

        var body: some View {
            VStack(spacing: 16) {
                Button(action: { loading.toggle() }, label: {
                    Text("Button")
                }).buttonStyle(.primary)

                Button(action: {}, label: {
                    Text("Button Two")
                })
                .isLoading(loading)
                .buttonStyle(.primary)

                Button(action: /*@START_MENU_TOKEN@*/{}/*@END_MENU_TOKEN@*/, label: {
                    Text("Button Three")
                })
                .buttonStyle(.primary)
                .disabled(true)
            }.frame(width: 300, height: 500)
        }
    }

    return PreviewWrapper()
}
