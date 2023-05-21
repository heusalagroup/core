// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { EntityMetadataUtils } from "./utils/EntityMetadataUtils";
import { EntityMetadata } from "./types/EntityMetadata";
import { createEntityCallback } from "./types/EntityCallback";
import { EntityCallbackType } from "./types/EntityCallbackType";
import { LogService } from "../LogService";
import { LogLevel } from "../types/LogLevel";

const LOG = LogService.createLogger( 'PreUpdate' );
LOG.setLogLevel(LogLevel.INFO);

/**
 * PreUpdate decorator.
 * Registers a callback to be executed before updating an entity.
 *
 * This callback is invoked before updating an entity. It is typically used to
 * perform pre-update tasks or validations.
 *
 * Cascaded update operations trigger the corresponding lifecycle methods of the
 * associated entities.
 *
 * The `@PreUpdate` callback is only called if the data is actually changed —
 * that is, if there's an actual SQL update statement to run.
 *
 * TODO: Document the invocation order of lifecycle callbacks.
 *
 * @returns {PropertyDecorator} The decorator function.
 * @throws {Error} If an exception is thrown from the callback. The transaction will be marked for rollback.
 */
export const PreUpdate = (): PropertyDecorator => {

    /**
     * Decorator function.
     *
     * @param {Object} target - The target object (class or prototype).
     * @param {string | symbol} propertyName - The name of the property being decorated.
     * @throws {TypeError} If the property name is not defined.
     */
    return (
        target: any,
        propertyName : string | symbol
    ) => {
        if (propertyName !== undefined) {
            LOG.debug(`Installing PRE_UPDATE callback for property "${propertyName.toString()}"`);
            EntityMetadataUtils.updateMetadata(target.constructor, (metadata: EntityMetadata) => {
                metadata.callbacks.push(
                    createEntityCallback(
                        propertyName,
                        EntityCallbackType.PRE_UPDATE
                    )
                );
            });
        } else {
            throw new TypeError(`The property name was not defined`);
        }
    };
};

/**
 * Sets the log level of the "PreUpdate" logger context.
 *
 * @param {LogLevel} level - The log level to set.
 */
PreUpdate.setLogLevel = (level: LogLevel) : void => {
    LOG.setLogLevel(level);
};
