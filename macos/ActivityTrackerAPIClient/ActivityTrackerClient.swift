//
//  ActivityTrackerClient.swift
//  ActivityTrackerAPIClient
//
//  Created by Sam Garson on 17/08/2024.
//

import Foundation
import OpenAPIURLSession

/// A client for interacting with the Activity Tracker API.
public class ActivityTrackerClient {
    public typealias User = Components.Schemas.User
    public typealias Provider = Components.Schemas.Provider

    /// The underlying HTTP client used for making API requests.
    private var client: Client

    /// Initializes a new instance of the ActivityTrackerClient.
    ///
    /// - Parameters:
    ///   - apiUrl: The base URL of the Activity Tracker API.
    ///   - token: An optional authentication token. If provided, it will be used
    ///            for authenticating requests to the API.
    public init(apiUrl: URL, token: String?) {
        self.client = Client(
            serverURL: apiUrl,
            transport: URLSessionTransport(),
            middlewares: [AuthenticationMiddleware(token: token)]
        )
    }
}

extension ActivityTrackerClient {
    /// Pings the Activity Tracker server to check if it's responsive.
    ///
    /// - Returns: A boolean indicating whether the ping was successful.
    ///            Returns `true` if the server responds with the expected "boop" message.
    /// - Throws: An error if the network request fails or if the response is unexpected.
    public func ping() async throws -> Bool {
        let response = try await self.client.ping()
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json.beep.rawValue == "boop"
        case .undocumented(statusCode: let statusCode, _):
            debugPrint(statusCode)
            return false
        }
    }

    /// Retrieves information about the currently authenticated user.
    ///
    /// - Returns: A `User` object containing the current user's information.
    /// - Throws: An error if the network request fails or if the response cannot be parsed.
    public func getCurrentUser() async throws -> User {
        let response = try await self.client.getCurrentUser()
        return try response.ok.body.json
    }
}

extension ActivityTrackerClient {
}
