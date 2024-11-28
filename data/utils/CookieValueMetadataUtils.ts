// CookieValueMetaDataUtils.ts

import 'reflect-metadata';
import {CookieValueMetadata} from "../types/CookieValueMetadata";


export class CookieValueMetadataUtils {
  public static getCookieMetadata(target: Object, propertyKey: string | symbol | undefined): CookieValueMetadata | undefined {
    return Reflect.getMetadata('cookieValueMetadata', target, propertyKey || 'default');
  }

  public static setCookieMetadata(metadata: CookieValueMetadata, target: Object, propertyKey: string | symbol | undefined): void {
    Reflect.defineMetadata('cookieValueMetadata', metadata, target, propertyKey || 'default');
  }
}