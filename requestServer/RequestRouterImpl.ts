// Copyright (c) 2022-2023. Heusala Group Oy <info@hg.fi>. All rights reserved.
// Copyright (c) 2020-2021. Sendanor <info@sendanor.fi>. All rights reserved.
// Copyright (c) 2020-2021. Sendanor <info@sendanor.fi>. All rights reserved.

import {
    getRequestControllerMappingObject,
    isRequestController,
    RequestController
} from "../request/types/RequestController";
import {parseRequestMethod, RequestMethod} from "../request/types/RequestMethod";
import {filter} from "../functions/filter";
import {forEach} from "../functions/forEach";
import {has} from "../functions/has";
import {isNull} from "../types/Null";
import {map} from "../functions/map";
import {trim} from "../functions/trim";
import {reduce} from "../functions/reduce";
import {concat} from "../functions/concat";
import {find} from "../functions/find";
import {keys} from "../functions/keys";
import {some} from "../functions/some";
import {RequestControllerMappingObject} from "../request/types/RequestControllerMappingObject";
import {RequestMappingObject} from "../request/types/RequestMappingObject";
import {isRequestStatus} from "../request/types/RequestStatus";
import {RequestParamValueType} from "../request/types/RequestParamValueType";
import {LogService} from "../LogService";
import {RequestRouterMappingPropertyObject} from "./types/RequestRouterMappingPropertyObject";
import {RequestRouterMappingObject} from "./types/RequestRouterMappingObject";
import {RequestParamObject} from "../request/types/RequestParamObject";
import {RequestControllerMethodObject} from "../request/types/RequestControllerMethodObject";
import {RequestQueryParamObject} from "../request/types/RequestQueryParamObject";
import {
    isReadonlyJsonAny,
    isReadonlyJsonArray,
    isReadonlyJsonObject,
    JsonAny,
    JsonObject,
    ReadonlyJsonObject
} from "../Json";
import {isResponseEntity, ResponseEntity} from "../request/types/ResponseEntity";
import {isRequestError, RequestError} from "../request/types/RequestError";
import {RequestParamObjectType} from "../request/types/RequestParamObjectType";
import {RequestHeaderParamObject} from "../request/types/RequestHeaderParamObject";
import {Headers} from "../request/types/Headers";
import {DefaultHeaderMapValuesType} from "../request/types/DefaultHeaderMapValuesType";
import {RequestHeaderMapParamObject} from "../request/types/RequestHeaderMapParamObject";
import {RouteUtils} from "./utils/RouteUtils";
import {BaseRoutes, RouteParamValuesObject} from "./types/BaseRoutes";
import {RequestPathVariableParamObject} from "../request/types/RequestPathVariableParamObject";
import {
    isRequestModelAttributeParamObject,
    RequestModelAttributeParamObject
} from "../request/types/RequestModelAttributeParamObject";
import {LogLevel} from "../types/LogLevel";
import {RequestRouter} from "./RequestRouter";
import {ParseRequestBodyCallback} from "./types/ParseRequestBodyCallback";
import {RequestQueryParameters} from "../request/utils/RequestQueryParameters";
import {parseRequestContextFromPath, RequestContext} from "./types/RequestContext";
import {AsyncSynchronizer} from "../AsyncSynchronizer";
import {AsyncSynchronizerImpl} from "../AsyncSynchronizerImpl";

const LOG = LogService.createLogger('RequestRouterImpl');

/**
 * Three item array with following items:
 *
 * 1. Attribute name     : string
 * 2. Property name      : string
 * 3. Property arguments : (RequestParamObject | null)[]
 *
 */
type ModelAttributeProperty = [string, string, (RequestParamObject | null)[]];

export class RequestRouterImpl implements RequestRouter {

    public static setLogLevel(level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private readonly _controllers: RequestController[];
    private _routes: BaseRoutes | undefined;
    private _modelAttributeNames: Map<RequestController, ModelAttributeProperty[]> | undefined;
    private _requestMappings: readonly RequestControllerMappingObject[] | undefined;
    private _initialized: boolean;

    /**
     * The `AsyncSynchronizer`
     * @private
     */
    private readonly _asyncSynchronizer: Map<string, AsyncSynchronizer>;

    protected constructor() {
        this._controllers = [];
        this._asyncSynchronizer = new Map<string, AsyncSynchronizer>();
        this._routes = undefined;
        this._requestMappings = undefined;
        this._modelAttributeNames = undefined;
        this._initialized = false;
    }

    public static create(
        ...controllers: readonly any[]
    ): RequestRouterImpl {
        const router = new RequestRouterImpl();
        forEach(
            controllers,
            (controller: any) => {
                if (!isRequestController(controller)) {
                    throw new TypeError(`RequestRouter: The provided controller was not RequestController: ${controller}`);
                }
                router.attachController(controller);
            }
        );
        return router;
    }

    public attachController(controller: RequestController): void {
        this._controllers.push(controller);
        this._routes = undefined;
    }

    public async handleRequest(
        methodString: RequestMethod,
        urlString: string | undefined = undefined,
        parseRequestBody: ParseRequestBodyCallback | undefined = undefined,
        requestHeaders: Headers
    ): Promise<ResponseEntity<any>> {

        try {

            const method: RequestMethod = parseRequestMethod(methodString);


            const {
                pathName,
                queryParams
            }: RequestContext = parseRequestContextFromPath(urlString);
            LOG.debug(`handleRequest: method="${method}", pathName="${pathName}", queryParams=`, queryParams);

            const requestPathName: string | undefined = pathName;

            const requestQueryParams: RequestQueryParameters = queryParams ?? {};
            // LOG.debug('requestQueryParams: ', requestQueryParams);

            if (requestPathName === undefined) {
                LOG.error('handleRequest: requestPathName was not initialized');
                return ResponseEntity.internalServerError().body({
                    error: 'Internal Server Error'
                });
            }

            if (!this._initialized) {
                this._initializeRouter();
            }

            const {
                routes,
                bodyRequired,
                pathVariables
            }: RequestContext = this._getRequestRoutesContext(method, requestPathName);

            if (!parseRequestBody && bodyRequired) {
                LOG.error('handleRequest: parseRequestBody was not provided and body is required');
                return ResponseEntity.internalServerError().body({
                    error: 'Internal Server Error'
                });
            }

            if (routes === undefined) {
                LOG.debug('handleRequest: No routes defined');
                return ResponseEntity.methodNotAllowed().body({
                    error: 'Method Not Allowed'
                });
            }

            if (routes.length === 0) {
                LOG.debug('handleRequest: No routes found');
                return ResponseEntity.notFound().body({
                    error: 'Not Found'
                });
            }

            LOG.debug('routes: ', routes);

            let responseEntity: ResponseEntity<any> | undefined = undefined;

            const requestBody = parseRequestBody && bodyRequired ? await parseRequestBody(requestHeaders) : undefined;
            LOG.debug('handleRequest: requestBody: ', requestBody);

            const requestModelAttributes = new Map<RequestController, Map<string, any>>();

            // Handle requests using controllers
            await reduce(routes, async (previousPromise, route: RequestRouterMappingPropertyObject) => {

                const routeController: any = route.controller;
                const routePropertyName: string = route.propertyName;
                const routePropertyParams: readonly (RequestParamObject | null)[] = route.propertyParams;

                const routeIndex: number = this._controllers.indexOf(routeController);

                await previousPromise;

                if (this._modelAttributeNames && this._modelAttributeNames.has(routeController)) {

                    LOG.debug(`Populating attributes for property "${routePropertyName}"`);

                    const modelAttributeValues: Map<string, any> = RequestRouterImpl._getOrCreateRequestModelAttributesForController(requestModelAttributes, routeController);

                    const routeAttributeNames: string[] = map(
                        filter(routePropertyParams, (item: any): item is RequestModelAttributeParamObject => isRequestModelAttributeParamObject(item)),
                        (item: RequestModelAttributeParamObject): string => item.attributeName
                    );
                    LOG.debug('route attributeNames: ', routeAttributeNames);

                    const allModelAttributeNamesForRouteController = this._modelAttributeNames.get(routeController);
                    LOG.debug('all attributeNamePairs: ', allModelAttributeNamesForRouteController);

                    const attributeNamePairs: ModelAttributeProperty[] = filter(
                        allModelAttributeNamesForRouteController ?? [],
                        (item: ModelAttributeProperty): boolean => routeAttributeNames.includes(item[0])
                    );
                    LOG.debug('attributeNamePairs: ', attributeNamePairs);

                    await reduce(attributeNamePairs, async (p: Promise<void>, pair: ModelAttributeProperty): Promise<void> => {

                        const [attributeName, propertyName, propertyParams] = pair;

                        await p;

                        LOG.debug('attributeName: ', attributeName);
                        LOG.debug('propertyName: ', propertyName);
                        LOG.debug('propertyParams: ', propertyParams);

                        const stepParams = RequestRouterImpl._bindRequestActionParams(
                            requestQueryParams,
                            requestBody,
                            propertyParams,
                            requestHeaders,
                            pathVariables,
                            modelAttributeValues
                        );

                        const stepResult: any = await routeController[propertyName](...stepParams);

                        modelAttributeValues.set(attributeName, stepResult);

                    }, Promise.resolve());

                }

                const stepParams = RequestRouterImpl._bindRequestActionParams(
                    requestQueryParams,
                    requestBody,
                    routePropertyParams,
                    requestHeaders,
                    pathVariables,
                    requestModelAttributes.get(routeController) ?? new Map<string, any>()
                );
                LOG.debug('handleRequest: stepParams 1: ', stepParams);

                if (!has(routeController, routePropertyName)) {
                    LOG.warn(`Warning! No property by name "${routePropertyName}" found in the controller`);
                    responseEntity = ResponseEntity.notFound<JsonObject>().body({error: "404 - Not Found", code: 404});
                    return;
                }

                let stepResult: any;

                // Lock processing if synchronized enabled
                const isSynchronized: boolean = route.synchronized;
                let synchronizerKey: string = '';
                let synchronizer: AsyncSynchronizer | undefined;

                if (isSynchronized) {

                    // Initialize the queue
                    synchronizerKey = `controller-${routeIndex}-method-${routePropertyName}`;
                    LOG.debug(`handleRequest: synchronizer: `, synchronizerKey);
                    synchronizer = this._asyncSynchronizer.get(synchronizerKey);
                    if (!synchronizer) {
                        synchronizer = AsyncSynchronizerImpl.create();
                        this._asyncSynchronizer.set(synchronizerKey, synchronizer);
                    }
                    LOG.debug(`handleRequest: Initialized request synchronizer [${synchronizerKey}]`);

                    stepResult = await synchronizer.run(async (): Promise<any> => {
                        LOG.debug(`handleRequest: Calling route property by name "${routePropertyName}"`);
                        return await routeController[routePropertyName](...stepParams);
                    });

                } else {
                    LOG.debug(`handleRequest: Calling route property by name "${routePropertyName}"`);
                    stepResult = await routeController[routePropertyName](...stepParams);
                }

                if (isRequestStatus(stepResult)) {
                    responseEntity = new ResponseEntity<any>(stepResult);
                } else if (isRequestError(stepResult)) {
                    responseEntity = new ResponseEntity<ReadonlyJsonObject>(stepResult.toJSON(), stepResult.getStatusCode());
                } else if (isResponseEntity(stepResult)) {
                    // FIXME: What if we already have stepResult??
                    if (responseEntity !== undefined) {
                        LOG.warn('Warning! ResponseEntity from previous call ignored.');
                    }
                    responseEntity = stepResult;
                } else if (isReadonlyJsonArray(stepResult)) {

                    if (responseEntity === undefined) {
                        responseEntity = ResponseEntity.ok(stepResult);
                    } else {
                        responseEntity = new ResponseEntity<any>(
                            concat(responseEntity.getBody(), stepResult),
                            responseEntity.getHeaders(),
                            responseEntity.getStatusCode()
                        );
                    }

                } else if (isReadonlyJsonObject(stepResult)) {

                    if (responseEntity === undefined) {
                        responseEntity = ResponseEntity.ok(stepResult);
                    } else {
                        responseEntity = new ResponseEntity<any>(
                            {
                                ...responseEntity.getBody(),
                                ...stepResult
                            },
                            responseEntity.getHeaders(),
                            responseEntity.getStatusCode()
                        );
                    }

                } else if (isReadonlyJsonAny(stepResult)) {

                    if (responseEntity === undefined) {
                        responseEntity = ResponseEntity.ok(stepResult);
                    } else {
                        LOG.warn('Warning! ResponseEntity from previous call ignored.');
                        responseEntity = new ResponseEntity<any>(
                            stepResult,
                            responseEntity.getHeaders(),
                            responseEntity.getStatusCode()
                        );
                    }

                } else {

                    if (responseEntity === undefined) {
                        responseEntity = ResponseEntity.ok(stepResult);
                    } else {
                        LOG.warn('Warning! ResponseEntity from previous call ignored.');
                        responseEntity = new ResponseEntity<any>(
                            stepResult,
                            responseEntity.getHeaders(),
                            responseEntity.getStatusCode()
                        );
                    }

                }

                // LOG.debug('handleRequest: result changed: ', responseEntity);

            }, Promise.resolve());

            LOG.debug('handleRequest: result finished: ' + responseEntity);

            // This never happens really, since 'routes' will always have more than one item at this point.
            if (responseEntity === undefined) {
                return ResponseEntity.noContent();
            }

            return responseEntity;

        } catch (err) {

            if (isRequestError(err)) {
                const status = err?.status ?? 0;
                if (status === 404) {
                    return ResponseEntity.notFound().body(err.toJSON());
                }
                if (status >= 400 && status < 500) {
                    return ResponseEntity.badRequest().status(status).body(err.toJSON());
                }
                return ResponseEntity.internalServerError().status(status).body(err.toJSON());
            }

            LOG.error('Exception: ', err);

            return ResponseEntity.internalServerError<JsonAny>().body({
                error: 'Internal Server Error',
                code: 500
            });

        }

    }

    private _initializeRequestMappings() {

        LOG.debug('Initializing request mappings.');

        if (!this._requestMappings) {
            this._requestMappings = this._getRequestMappings();
        }

    }

    private _initializeRouter() {

        if (!this._initialized) {

            this._initialized = true;

            LOG.debug('Initializing...');

            this._initializeRequestMappings();
            this._initializeRoutes();
            this._initializeRequiredModelAttributeNames();

        }

    }

    private _initializeRoutes() {

        LOG.debug('Initializing routes.');

        if (this._requestMappings?.length) {
            this._routes = RouteUtils.createRoutes(RequestRouterImpl._parseMappingObject(this._requestMappings));
        } else {
            this._routes = RouteUtils.createRoutes({});
        }

    }

    private _initializeRequiredModelAttributeNames() {

        LOG.debug('Initializing model attributes.');

        let values: [RequestController, ModelAttributeProperty[]][] = [];

        if (this._requestMappings?.length) {
            values = reduce(
                this._requestMappings,
                (arr: [RequestController, ModelAttributeProperty[]][], item: RequestControllerMappingObject) => {

                    const controller = item.controller;

                    const controllerUniqueAttributeNames: ModelAttributeProperty[] = reduce(
                        keys(item.controllerProperties),
                        (arr2: ModelAttributeProperty[], propertyKey: string): ModelAttributeProperty[] => {

                            LOG.debug('_initializeRequiredModelAttributeNames: propertyKey: ', propertyKey);

                            const propertyValue: RequestControllerMethodObject = item.controllerProperties[propertyKey];

                            const propertyAttributeNames: readonly string[] = propertyValue.modelAttributes;

                            LOG.debug('_initializeRequiredModelAttributeNames: propertyAttributeNames: ', propertyAttributeNames);

                            const params: (RequestParamObject | null)[] = [...propertyValue.params];

                            forEach(propertyAttributeNames, (attributeName: string) => {
                                LOG.debug('_initializeRequiredModelAttributeNames: attributeName: ', attributeName);
                                if (find(arr2, (i: ModelAttributeProperty) => i[0] === attributeName) === undefined) {
                                    arr2.push([attributeName, propertyKey, params]);
                                }
                            });

                            return arr2;

                        }, []);

                    LOG.debug('controllerUniqueAttributeNames: ', controllerUniqueAttributeNames);

                    values.push([controller, controllerUniqueAttributeNames]);

                    return arr;

                }, values
            );
        }

        this._modelAttributeNames = new Map<RequestController, ModelAttributeProperty[]>(values);

    }

    private _getRequestRoutesContext(
        method: RequestMethod,
        requestPathName: string
    ): RequestContext {

        if (!this._routes || !this._routes.hasRoute(requestPathName)) {
            if (!this._routes) {
                LOG.debug(`_getRequestRoutesContext: No routes defined`);
            } else {
                LOG.debug(`_getRequestRoutesContext: Routes did not match: `, requestPathName);
            }
            return {
                routes: [],
                bodyRequired: false
            };
        }

        // LOG.debug('_getRequestRoutesContext: requestPathName: ', requestPathName);
        // LOG.debug('_getRequestRoutesContext: method: ', method);

        let [routes, pathVariables] = this._routes.getRoute(requestPathName);

        routes = filter(
            routes,
            (item: RequestRouterMappingPropertyObject): boolean => {
                return item.methods.indexOf(method) >= 0;
            }
        );

        // LOG.debug('_getRequestRoutesContext: routes: ', routes);

        if (!routes.length) {
            // There were matching routes, but not for this method; Method not allowed.
            LOG.debug(`_getRequestRoutesContext: There were matching routes, but not for this method; Method not allowed.`);
            return {
                routes: undefined,
                bodyRequired: false
            };
        }

        const requestBodyRequired = some(routes, item => item?.requestBodyRequired === true);
        LOG.debug(`_getRequestRoutesContext: requestBodyRequired=`, requestBodyRequired);
        return {
            routes,
            pathVariables,
            bodyRequired: requestBodyRequired
        };

    }

    private _getRequestMappings(): RequestControllerMappingObject[] {
        if (this._controllers.length === 0) {
            return [];
        }
        return filter(
            map(
                this._controllers,
                (controller: RequestController) => getRequestControllerMappingObject(controller)
            ),
            (item: RequestControllerMappingObject | undefined): boolean => !!item
        ) as RequestControllerMappingObject[];
    }

    private static _parseMappingObject(
        requestMappings: readonly RequestControllerMappingObject[]
    ): RequestRouterMappingObject {

        const routeMappingResult: RequestRouterMappingObject = {};

        function setRouteMappingResult(
            path: string,
            mapping: RequestRouterMappingPropertyObject
        ) {

            if (!has(routeMappingResult, path)) {
                routeMappingResult[path] = [mapping];
                return;
            }

            routeMappingResult[path].push(mapping);

        }

        forEach(requestMappings, (rootItem: RequestControllerMappingObject) => {

            const controller = rootItem.controller;
            const controllerProperties = rootItem.controllerProperties;
            const controllerPropertyNames = keys(controllerProperties);

            if (rootItem.mappings.length > 0) {

                // Controller has root mappings

                forEach(rootItem.mappings, (rootMappingItem: RequestMappingObject) => {

                    const rootMethods = rootMappingItem.methods;

                    forEach(rootMappingItem.paths, (rootPath: string) => {

                        forEach(controllerPropertyNames, (propertyKey: string) => {

                            const propertyValue: RequestControllerMethodObject = controllerProperties[propertyKey];
                            const propertyParams: readonly (RequestParamObject | null)[] = propertyValue.params;

                            forEach(propertyValue.mappings, (propertyMappingItem: RequestMappingObject) => {

                                // Filters away any property routes which do not have common methods
                                const propertyMethods: readonly RequestMethod[] = propertyMappingItem.methods;

                                if (!RequestRouterImpl._matchMethods(rootMethods, propertyMethods)) {
                                    return;
                                }

                                const propertyMethodsCommonWithRoot: readonly RequestMethod[] = RequestRouterImpl._parseCommonMethods(rootMethods, propertyMethods);

                                const propertyPaths: readonly string[] = propertyMappingItem.paths;

                                forEach(propertyPaths, (propertyPath: string) => {

                                    const fullPropertyPath = RequestRouterImpl._joinRoutePaths(rootPath, propertyPath);

                                    setRouteMappingResult(
                                        fullPropertyPath,
                                        {
                                            requestBodyRequired: propertyValue?.requestBodyRequired ?? false,
                                            synchronized: propertyValue?.synchronized ?? false,
                                            methods: propertyMethodsCommonWithRoot,
                                            controller: controller,
                                            propertyName: propertyKey,
                                            propertyParams: propertyParams
                                        }
                                    );

                                });

                            });

                        });

                    });

                });

            } else {

                // We don't have parent controller mappings, so expect method mappings to be global.

                forEach(controllerPropertyNames, (propertyKey: string) => {

                    const propertyValue: RequestControllerMethodObject = controllerProperties[propertyKey];
                    const propertyParams: readonly (RequestParamObject | null)[] = propertyValue.params;

                    forEach(propertyValue.mappings, (propertyMappingItem: RequestMappingObject) => {

                        const propertyMethods: readonly RequestMethod[] = propertyMappingItem.methods;
                        const propertyPaths: readonly string[] = propertyMappingItem.paths;

                        forEach(propertyPaths, (propertyPath: string) => {

                            setRouteMappingResult(
                                propertyPath,
                                {
                                    requestBodyRequired: propertyValue?.requestBodyRequired ?? false,
                                    synchronized: propertyValue?.synchronized ?? false,
                                    methods: propertyMethods,
                                    controller: controller,
                                    propertyName: propertyKey,
                                    propertyParams: propertyParams
                                }
                            );

                        });

                    });

                });

            }

        });

        return routeMappingResult;

    }

    private static _matchMethods(
        rootMethods: readonly RequestMethod[],
        propertyMethods: readonly RequestMethod[]
    ): boolean {

        if (rootMethods.length === 0) return true;

        if (propertyMethods.length == 0) return true;

        return some(rootMethods, (rootMethod: RequestMethod): boolean => {
            return some(propertyMethods, (propertyMethod: RequestMethod): boolean => {
                return rootMethod === propertyMethod;
            });
        });

    }

    private static _parseCommonMethods(
        rootMethods: readonly RequestMethod[],
        propertyMethods: readonly RequestMethod[]
    ): readonly RequestMethod[] {
        return (
            rootMethods.length !== 0
                ? filter(
                    propertyMethods,
                    (propertyMethod: RequestMethod): boolean => {
                        return some(rootMethods, (rootMethod: RequestMethod): boolean => {
                            return rootMethod === propertyMethod;
                        });
                    }
                )
                : propertyMethods
        );
    }

    private static _joinRoutePaths(a: string, b: string): string {

        a = trim(a);
        b = trim(trim(b), "/");

        if (b.length === 0) return a;
        if (a.length === 0) return b;

        if (a[a.length - 1] === '/' || b[0] === '/') {
            return a + b;
        }

        return a + '/' + b;

    }

    private static _bindRequestActionParams(
        searchParams: RequestQueryParameters,
        requestBody: JsonAny | undefined,
        params: readonly (RequestParamObject | null)[],
        requestHeaders: Headers,
        pathVariables: RouteParamValuesObject | undefined,
        modelAttributes: Map<string, any>
    ): any[] {
        return map(params, (item: RequestParamObject | null): any => {

            if (item === null) {
                return undefined;
            }

            const objectType: RequestParamObjectType | undefined = item?.objectType;

            switch (objectType) {

                case RequestParamObjectType.REQUEST_BODY:
                    return requestBody;

                case RequestParamObjectType.QUERY_PARAM: {
                    const queryParamItem: RequestQueryParamObject = item as RequestQueryParamObject;
                    const key = queryParamItem.queryParam;
                    if (key === undefined) {
                        return RequestRouterImpl._castObjectParam(searchParams, queryParamItem.valueType);
                    }
                    if (!has(searchParams, key)) return undefined;
                    const value: string | null = searchParams[key];
                    if (isNull(value)) return undefined;
                    return RequestRouterImpl._castStringParam(value, queryParamItem.valueType);
                }

                case RequestParamObjectType.REQUEST_HEADER: {

                    const headerItem: RequestHeaderParamObject = item as RequestHeaderParamObject;

                    const headerName = headerItem.headerName;

                    if (!requestHeaders.containsKey(headerName)) {

                        if (headerItem.isRequired) {
                            throw new RequestError(400, `Bad Request: Header missing: ${headerName}`);
                        }

                        return headerItem?.defaultValue ?? undefined;

                    }

                    const headerValue: string | undefined = requestHeaders.getFirst(headerName);

                    if (headerValue === undefined) return undefined;

                    return RequestRouterImpl._castStringParam(headerValue, headerItem.valueType);

                }

                case RequestParamObjectType.REQUEST_HEADER_MAP: {

                    const headerItem: RequestHeaderMapParamObject = item as RequestHeaderMapParamObject;

                    const defaultHeaders: DefaultHeaderMapValuesType | undefined = headerItem?.defaultValues;

                    if (requestHeaders.isEmpty()) {

                        if (defaultHeaders) {
                            return new Headers(defaultHeaders);
                        } else {
                            return new Headers();
                        }

                    } else {

                        if (defaultHeaders) {
                            return new Headers({
                                ...defaultHeaders,
                                ...requestHeaders.valueOf()
                            });
                        } else {
                            return requestHeaders.clone();
                        }

                    }

                }

                case RequestParamObjectType.PATH_VARIABLE: {

                    const pathParamItem: RequestPathVariableParamObject = item as RequestPathVariableParamObject;

                    const variableName = pathParamItem.variableName;

                    const variableValue = pathVariables && has(pathVariables, variableName) ? pathVariables[variableName] : undefined;

                    if (variableValue !== undefined && variableValue !== '') {

                        if (pathParamItem.decodeValue) {
                            return decodeURIComponent(variableValue);
                        }

                        return variableValue;

                    } else {

                        if (pathParamItem.isRequired) {
                            throw new RequestError(404, `Not Found`);
                        }

                        return pathParamItem.defaultValue ?? undefined;
                    }

                }

                case RequestParamObjectType.MODEL_ATTRIBUTE: {

                    const modelAttributeItem: RequestModelAttributeParamObject = item as RequestModelAttributeParamObject;

                    const key = modelAttributeItem.attributeName;

                    return modelAttributes.has(key) ? modelAttributes.get(key) : undefined;

                }


            }

            throw new TypeError(`Unsupported item type: ${item}`);

        });
    }

    private static _castStringParam(
        value: string,
        type: RequestParamValueType
    ): any {

        switch (type) {

            case RequestParamValueType.REGULAR_OBJECT:
                throw new TypeError(`Incorrect value type for string value: ${type}`);

            case RequestParamValueType.JSON:
                return JSON.parse(value);

            case RequestParamValueType.STRING:
                return value;

            case RequestParamValueType.INTEGER:
                return parseInt(value, 10);

            case RequestParamValueType.NUMBER:
                return parseFloat(value);

        }

        throw new TypeError(`Unsupported type: ${type}`)
    }

    private static _castObjectParam(
        value: { readonly [key: string]: string },
        type: RequestParamValueType
    ): any {
        switch (type) {
            case RequestParamValueType.REGULAR_OBJECT:
                return JSON.parse(JSON.stringify(value));

            case RequestParamValueType.JSON:
            case RequestParamValueType.STRING:
            case RequestParamValueType.INTEGER:
            case RequestParamValueType.NUMBER:
                throw new TypeError(`Incorrect value type for non-string value: ${type}`);

        }
        throw new TypeError(`Unsupported type: ${type}`)
    }

    private static _getOrCreateRequestModelAttributesForController(
        requestModelAttributes: Map<RequestController, Map<string, any>>,
        routeController: any
    ): Map<string, any> {

        let modelAttributeValues: Map<string, any> | undefined = requestModelAttributes.get(routeController);

        if (modelAttributeValues != undefined) {
            return modelAttributeValues;
        }

        modelAttributeValues = new Map<string, any>();
        requestModelAttributes.set(routeController, modelAttributeValues);
        return modelAttributeValues;

    }

}
