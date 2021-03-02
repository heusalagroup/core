import EntityMetadata from "./EntityMetadata";

export default interface Persister {
    insert<T>(entity: T, metadata: EntityMetadata): Promise<T>;
    update<T>(entity: T, metadata: EntityMetadata): Promise<T>;
    delete<T>(entity: T, metadata: EntityMetadata): Promise<void>;
    findAll<T>(metadata: EntityMetadata): Promise<T[]>;
    findById<T>(id: string, metadata: EntityMetadata): Promise<T | undefined>;
}
