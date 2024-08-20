//
//  AuthMiddleware.swift
//  ActivityTrackerAPIClient
//
//  Created by Sam Garson on 18/08/2024.
//

import Foundation
import OpenAPIRuntime
import HTTPTypes

/// A client middleware that injects a value into the `Authorization` header field of the request.
struct AuthenticationMiddleware {

    /// The value for the `Authorization` header field.
    private let value: String?

    /// Creates a new middleware.
    /// - Parameter value: The value for the `Authorization` header field.
    package init(token value: String?) { self.value = value }
}

extension AuthenticationMiddleware: ClientMiddleware {
    package func intercept(
        _ request: HTTPRequest,
        body: HTTPBody?,
        baseURL: URL,
        operationID: String,
        next: (HTTPRequest, HTTPBody?, URL) async throws -> (HTTPResponse, HTTPBody?)
    ) async throws -> (HTTPResponse, HTTPBody?) {
        var request = request
        if let token = value {
            request.headerFields[.authorization] = "Bearer \(token)"
        }

        return try await next(request, body, baseURL)
    }
}
