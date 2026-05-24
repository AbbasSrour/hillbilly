/* @hillbilly-sync */
import { AsyncLocalStorage } from "node:async_hooks";
import type { Collection, Opt } from "@mikro-orm/core";
import { PrimaryKey, Property } from "@mikro-orm/decorators/legacy";

import type { Constructor } from "@/types/utils";
import { v4 } from "uuid";
import type { AbstractDto } from "../dto/abstract.dto";
import type { AbstractTranslationEntity } from "./abstract-translation.entity";

/**
 * Type definition for the entity tracking context
 * This context is stored in AsyncLocalStorage and used to track visited entities
 * during DTO conversion to prevent circular references.
 */
interface EntityTrackingContext {
  /**
   * A unique identifier for the current conversion process
   * Each top-level call to toDto() gets its own unique processId
   */
  processId: string;

  /**
   * A Set of entity keys that have been visited during the current conversion process
   * Each key is in the format "{EntityType}:{EntityId}"
   */
  visitedEntities: Set<string>;
}

/**
 * AsyncLocalStorage to maintain request-scoped context for entity tracking
 * This ensures that each request has its own isolated tracking mechanism,
 * preventing interference between concurrent requests.
 *
 * The storage contains the current tracking context with:
 * - processId: A unique identifier for the current conversion process
 * - visitedEntities: A Set of entity keys that have been visited during that process
 *
 * This implementation ensures that multiple concurrent calls to toDto() within
 * the same request don't interfere with each other, as each gets its own
 * isolated tracking context.
 *
 * Using AsyncLocalStorage eliminates the need to manually pass tracking information
 * through options in nested toDto calls, making the code cleaner and less error-prone.
 */
const entityTrackerStorage = new AsyncLocalStorage<EntityTrackingContext>();

/**
 * Abstract Entity
 * @author Narek Hakobyan <narek.hakobyan.07@gmail.com>
 * @author Abbas Srour <abbas.mj.srour@gmail.com>
 *
 * @description This class is an abstract class for all entities.
 * It takes two generic types: DTO for a data transfer object and O for page options.
 * It takes care of the id, createdAt, updatedAt fields and translations.
 */
export abstract class AbstractEntity<
  DTO extends AbstractDto = AbstractDto,
  O = unknown,
  Optional = unknown,
> {
  @PrimaryKey({ type: "uuid", defaultRaw: "uuid_generate_v4()", onCreate: () => v4() as Uuid })
  public readonly id!: Uuid;

  @Property({
    type: "timestamp with time zone",
    columnType: "timestamp with time zone",
    defaultRaw: "CURRENT_TIMESTAMP",
    onCreate: () => new Date(),
  })
  public readonly createdAt: Opt<Date> = new Date();

  @Property({
    type: "timestamp with time zone",
    columnType: "timestamp with time zone",
    defaultRaw: "CURRENT_TIMESTAMP",
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  public readonly updatedAt: Opt<Date> = new Date();

  translations?: Collection<AbstractTranslationEntity>;

  dtoClass?: () => Constructor<DTO, [AbstractEntity, O?, Optional?]>;

  /**
   * Converts this entity to a DTO (Data Transfer Object).
   *
   * This method handles circular references by tracking visited entities using AsyncLocalStorage.
   * Each top-level call to this method gets its own unique tracking context,
   * ensuring that concurrent calls within the same request don't interfere
   * with each other.
   *
   * The tracking context is automatically propagated to nested toDto calls,
   * eliminating the need to manually pass tracking information through options.
   *
   * @param options Optional parameters to customize the DTO conversion
   * @returns A DTO representation of this entity
   */
  toDto(options?: O): DTO {
    const dtoClass = Object.getPrototypeOf(this).dtoClass?.();
    if (!dtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      );
    }

    const entityId = this.id;
    const entityType = this.constructor.name;
    const entityKey = `${entityType}:${entityId}`;

    // Get or initialize the request-scoped context
    const context = entityTrackerStorage.getStore();
    if (!context) {
      // If no context exists, create a new one and run the conversion within it
      return this.runWithNewContext(options);
    }

    // If this entity has already been visited, use toSerial to prevent circular reference
    if (context.visitedEntities.has(entityKey)) {
      return this.toSerial(options);
    }

    // Mark this entity as visited
    context.visitedEntities.add(entityKey);

    // Create the DTO
    const dto = new dtoClass(this, options);

    // Remove this entity from visited set after processing to allow it in other paths
    context.visitedEntities.delete(entityKey);

    return dto;
  }

  /**
   * Runs the toDto conversion in a new AsyncLocalStorage context
   *
   * This method creates a new tracking context with a unique processId and
   * runs the toDto conversion within that context. This ensures that each
   * top-level conversion has its own isolated tracking, preventing interference
   * between concurrent conversions.
   *
   * The tracking context is automatically propagated to nested toDto calls
   * through AsyncLocalStorage, eliminating the need to manually pass tracking
   * information through options.
   */
  private runWithNewContext(options?: O): DTO {
    // Create a new tracking context with a unique processId
    const context: EntityTrackingContext = {
      processId: v4(),
      visitedEntities: new Set<string>(),
    };

    let result: DTO;
    entityTrackerStorage.run(context, () => {
      result = this.toDto(options);
    });

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return result!;
  }

  /**
   * Creates a minimal DTO representation of the entity with just the essential fields.
   * Used to prevent circular references in entity-to-DTO conversion.
   * Includes id, createdAt, and updatedAt to provide a more complete but still minimal representation.
   *
   * This method is called when a circular reference is detected during the toDto process.
   */
  private toSerial(options?: O): DTO {
    const dtoClass = Object.getPrototypeOf(this).dtoClass?.();
    if (!dtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      );
    }

    return new dtoClass(
      {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      },
      options,
    );
  }
}
