// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2020-2021 Sendanor. All rights reserved.

import { RequestMethod } from "./request/types/RequestMethod";
import { JsonAny } from "./Json";
import { RequestClientInterface } from "./requestClient/RequestClientInterface";
import { LogService } from "./LogService";
import { REQUEST_CLIENT_FETCH_ENABLED, REQUEST_CLIENT_NODE_ENABLED } from "./requestClient/request-client-constants";
import { NodeRequestClient } from "./requestClient/node/NodeRequestClient";
import { FetchRequestClient } from "./requestClient/fetch/FetchRequestClient";
import { LogLevel } from "./types/LogLevel";
import { WindowObjectService } from "../frontend/services/WindowObjectService";

export const HTTP = REQUEST_CLIENT_NODE_ENABLED ? require('http') : undefined;
export const HTTPS = REQUEST_CLIENT_NODE_ENABLED ? require('https') : undefined;

const LOG = LogService.createLogger('RequestClient');

export class RequestClient {

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
        NodeRequestClient.setLogLevel(level);
    }

    private static _client : RequestClientInterface = RequestClient._initClient();

    public static async textRequest (
        method   : RequestMethod,
        url      : string,
        headers ?: {[key: string]: string},
        data    ?: string
    ) : Promise<string| undefined> {
        return await this._client.textRequest(method, url, headers, data);
    }

    public static async getText (
        url      : string,
        headers ?: {[key: string]: string}
    ) : Promise<string| undefined> {
        // LOG.debug('.getJson: ', url, headers);
        return await this._client.textRequest(RequestMethod.GET, url, headers);
    }

    public static async postText (
        url      : string,
        data    ?: string,
        headers ?: {[key: string]: string}
    ) : Promise<string| undefined> {
        LOG.debug('.postJson: ', url, data, headers);
        return await this._client.textRequest(RequestMethod.POST, url, headers, data);
    }

    public static async patchText (
        url      : string,
        data    ?: string,
        headers ?: {[key: string]: string}
    ) : Promise<string| undefined> {
        LOG.debug('.patchJson: ', url, data, headers);
        return await this._client.textRequest(RequestMethod.PATCH, url, headers, data);
    }

    public static async putText (
        url      : string,
        data    ?: string,
        headers ?: {[key: string]: string}
    ) : Promise<string| undefined> {
        LOG.debug('.putJson: ', url, data, headers);
        return await this._client.textRequest(RequestMethod.PUT, url, headers, data);
    }

    public static async deleteText (
        url      : string,
        headers ?: {[key: string]: string},
        data    ?: string
    ) : Promise<string| undefined> {
        LOG.debug('.deleteJson: ', url, data, headers);
        return await this._client.textRequest(RequestMethod.DELETE, url, headers, data);
    }

    public static async jsonRequest (
        method   : RequestMethod,
        url      : string,
        headers ?: {[key: string]: string},
        data    ?: JsonAny
    ) : Promise<JsonAny| undefined> {
        return await this._client.jsonRequest(method, url, headers, data);
    }

    public static async getJson (
        url      : string,
        headers ?: {[key: string]: string}
    ) : Promise<JsonAny| undefined> {
        // LOG.debug('.getJson: ', url, headers);
        return await this._client.jsonRequest(RequestMethod.GET, url, headers);
    }

    public static async postJson (
        url      : string,
        data    ?: JsonAny,
        headers ?: {[key: string]: string}
    ) : Promise<JsonAny| undefined> {
        LOG.debug('.postJson: ', url, data, headers);
        return await this._client.jsonRequest(RequestMethod.POST, url, headers, data);
    }

    public static async patchJson (
        url      : string,
        data    ?: JsonAny,
        headers ?: {[key: string]: string}
    ) : Promise<JsonAny| undefined> {
        LOG.debug('.patchJson: ', url, data, headers);
        return await this._client.jsonRequest(RequestMethod.PATCH, url, headers, data);
    }

    public static async putJson (
        url      : string,
        data    ?: JsonAny,
        headers ?: {[key: string]: string}
    ) : Promise<JsonAny| undefined> {
        LOG.debug('.putJson: ', url, data, headers);
        return await this._client.jsonRequest(RequestMethod.PUT, url, headers, data);
    }

    public static async deleteJson (
        url      : string,
        headers ?: {[key: string]: string},
        data    ?: JsonAny
    ) : Promise<JsonAny| undefined> {
        LOG.debug('.deleteJson: ', url, data, headers);
        return await this._client.jsonRequest(RequestMethod.DELETE, url, headers, data);
    }

    private static _initClient () : RequestClientInterface {
        if ( REQUEST_CLIENT_FETCH_ENABLED && WindowObjectService.hasWindow() ) {
            LOG.debug('Detected browser environment');
            const w = WindowObjectService.getWindow();
            return new FetchRequestClient( w.fetch.bind(w) );
        }
        if ( REQUEST_CLIENT_NODE_ENABLED ) {
            // Could not control this with LOG_LEVEL on rolluped content
            // LOG.debug('Detected NodeJS environment');
            return new NodeRequestClient(HTTP, HTTPS);
        }
        throw new TypeError(`Could not detect request client implementation`);
    }
}
