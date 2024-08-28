//
//  ButtonLoadingModifier.swift
//  Activity Tracker
//
//  Created by Sam Garson on 28/08/2024.
//

import Foundation
import SwiftUI

struct IsloadingEnvironmentKey: EnvironmentKey {
    static var defaultValue: Bool = false
}

extension EnvironmentValues {
    public var isLoading: Bool {
        get { self[IsloadingEnvironmentKey.self] }
        set { self[IsloadingEnvironmentKey.self] = newValue }
    }
}

struct Loading: ViewModifier {
    var loading: Bool = false

    func body(content: Content) -> some View {
        content
            .environment(\.isLoading, loading)
    }
}

extension Button {
    func isLoading(_ loading: Bool) -> some View {
        modifier(Loading(loading: loading))
    }
}
