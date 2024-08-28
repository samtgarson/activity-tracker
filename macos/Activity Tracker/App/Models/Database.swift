//
//  Container.swift
//  Activity Tracker
//
//  Created by Sam Garson on 25/08/2024.
//

import Foundation
import SwiftData

/// A wrapper around SwiftData ModelContainer
@MainActor
final class Database {
    static let instance = Database()
    static func testInstance() -> Database {
        Database(useInMemoryStore: true)
    }
    static func testInstance(with models: [any PersistentModel]) -> Database {
        let database = testInstance(), context = database.container.mainContext
        models.forEach { model in context.insert(model) }
        return database
    }

    static let models: [any PersistentModel.Type] = [
        Account.self
    ]

    let container: ModelContainer

    init(useInMemoryStore: Bool = false) {
        let schema = Schema(Database.models)
        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: useInMemoryStore
        )
        do {
            container = try ModelContainer(
                for: schema,
                configurations: configuration
            )
            debugPrint("sqlite3 \"\(configuration.url.path(percentEncoded: false))\"")
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }

    func reset() {
        do {
            let context = ModelContext(container)
            try Database.models.forEach { model in
                try context.delete(model: model)
            }
        } catch {
            print("Failed to clear all Country and City data.")
        }
    }
}

/// A protocol describing a SwiftDataModel
protocol DatabaseModel where Self: PersistentModel {
    func create() throws
    func delete() throws
    static func read(
        predicate: Predicate<Self>?,
        sortDescriptors: SortDescriptor<Self>...
    ) throws -> [Self]
    static func create(_ items: [Self]) throws
}

extension DatabaseModel {
    /// Create or update this item in the database
    func create() throws {
        let context = ModelContext(Database.instance.container)
        context.insert(self)
        try context.save()
    }

    /// Remove this item from the database
    func delete() throws {
        let context = ModelContext(Database.instance.container)
        let idToDelete = self.persistentModelID
        try context.delete(model: Self.self, where: #Predicate { item in
            item.persistentModelID == idToDelete
        })
        try context.save()
    }

    /// Query the database for this class
    static func read(
        predicate: Predicate<Self>?,
        sortDescriptors: SortDescriptor<Self>...
    ) throws -> [Self] {
        let context = ModelContext(Database.instance.container)
        let fetchDescriptor = FetchDescriptor<Self>(
            predicate: predicate,
            sortBy: sortDescriptors
        )
        return try context.fetch(fetchDescriptor)
    }

    /// Create or update these items in the database using a single transaction
    static func create(_ items: [Self]) throws {
        let context = ModelContext(Database.instance.container)
        items.forEach { item in context.insert(item) }
        try context.save()
    }
}
