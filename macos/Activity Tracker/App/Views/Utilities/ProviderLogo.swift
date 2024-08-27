//
//  ProviderLogo.swift
//  Activity Tracker
//
//  Created by Sam Garson on 25/08/2024.
//

import SwiftUI

struct ProviderLogo: View {
    var provider: Provider
    var size: CGFloat = 40

    var body: some View {
        ZStack {
            Color.white
            Image(source).resizable().aspectRatio(contentMode: .fit).padding(.all, size * 0.15)
        }
        .clipShape(Circle())
        .frame(width: size, height: size)
    }

    private var source: String {
        switch provider {
        case .google:
            return "logos/google"
        }
    }
}

#Preview {
    ProviderLogo(provider: .google)
}
