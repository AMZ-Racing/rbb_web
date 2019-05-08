/*
 * AMZ-Driverless
 * Copyright (c) 2019 Authors:
 *   - Huub Hendrikx <hhendrik@ethz.ch>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import ApiHelper from "client/ApiHelper";
import { BagExtractionConfiguration, BagStoreDetailed, BagStoreSummary } from "client/api";

export enum SortOrder {
  Ascending = "asc",
  Descending = "desc",
  None = ""
}

export interface BagStoreWithExtractionConfig extends BagStoreDetailed {
  extractionConfigs: string[];
}

export interface DateRangeFilter {
  lowerThanEqual?: Date;
  greaterThanEqual?: Date;
}

export interface NumberRangeFilter {
  lowerThanEqual?: number;
  greaterThanEqual?: number;
}

export class BagFilter {
  discovered: DateRangeFilter = {
    lowerThanEqual: undefined,
    greaterThanEqual: undefined
  };
  startTime: DateRangeFilter = {
    lowerThanEqual: undefined,
    greaterThanEqual: undefined
  };
  duration: NumberRangeFilter = {
    lowerThanEqual: undefined,
    greaterThanEqual: undefined
  };
  name:string = "";
  tags:string[];
  trash:boolean = false;
}

export default class BagManager {
  private static keywordsToLikeString(keywords: string) : string | undefined {
    const trimmedKeywords = keywords
        .split(" ")
        .map((s) => s.trim())
        .filter((s) => s !== "")

    if (trimmedKeywords.length > 0) {
      return "%" + trimmedKeywords.join("%") + "%";
    } else {
      return undefined;
    }

  }

  public static setBagDescription(store: string, bagName: string, description: string) {
    const api = ApiHelper.getBasicApi();
    const patch = {
      comment: description
    };
    return api.patchBagMeta(store, bagName, patch);
  }

  public static setBagInTrash(store: string, bagName: string, in_trash: boolean) {
    const api = ApiHelper.getBasicApi();
    const patch = {
      in_trash
    };
    return api.patchBagMeta(store, bagName, patch);
  }

  public static setBagTags(store: string, bagName: string, tags: string[], autoCreate?: boolean) {
    const api = ApiHelper.getBasicApi();
    return api.putBagTags(store, bagName, tags, autoCreate !== undefined ? autoCreate : true);
  }

  public static getBagStoreNames() {
    const api = ApiHelper.getBasicApi();
    const stores = api.listStores();
    return stores.then((list) => list.map((bag) => bag.name));
  }

  public static getExtractionConfigurations() {
    const api = ApiHelper.getBasicApi();
    return api.listExtractionConfigurations();
  }

  public static getBagStores() {
    const api = ApiHelper.getBasicApi();
    return api.listStores();
  }

  public static getBagStore(name: string) {
    const api = ApiHelper.getBasicApi();
    return api.getStore(name);
  }

  public static getBagStoreWithExtractionConfig(name: string) : Promise<BagStoreWithExtractionConfig> {
    const api = ApiHelper.getBasicApi();

    const storePromise = api.getStore(name);
    const extractionConfigsPromise = api.getStoreExtractionConfigs(name);

    return Promise.all([storePromise, extractionConfigsPromise]).then((data) => {
      return {
        extractionConfigs: data[1].map((config) => { return config.name; }),
        ...data[0]
      };
    });
  }

  public static saveBagStoreWithExtractionConfig(combo: BagStoreWithExtractionConfig, blockOnExisting: boolean = false) : Promise<BagStoreWithExtractionConfig> {
    const api = ApiHelper.getBasicApi();

    return api.putStore(combo.name, combo, blockOnExisting).then((resultStore) => {
      return api.putStoreExtractionConfigs(resultStore.name, combo.extractionConfigs).then(resultConfigs => {
        return {
          extractionConfigs: resultConfigs,
          ...resultStore
        };
      });
    });
  }

  public static saveBagStore(store: BagStoreDetailed) {
    const api = ApiHelper.getBasicApi();
    return api.putStore(store.name, store);
  }

  public static deleteBagStore(store: BagStoreSummary) {
    const api = ApiHelper.getBasicApi();
    return api.deleteStore(store.name);
  }

  public static deleteBagExtractionConfiguration(config: BagExtractionConfiguration) {
    const api = ApiHelper.getBasicApi();
    return api.deleteExtractionConfiguration(config.name);
  }

  public static saveBagExtractionConfiguration(config: BagExtractionConfiguration) {
    const api = ApiHelper.getBasicApi();
    return api.putExtractionConfiguration(config.name, config);
  }

  public static newBagExtractionConfiguration(config: BagExtractionConfiguration) {
    const api = ApiHelper.getBasicApi();
    return api.putExtractionConfiguration(config.name, config, true);
  }

  public static getBagsFromStore(storeName: string, limit?: number, offset?: number, ordering?: string, filterOptional?: BagFilter) {
    const api = ApiHelper.getBasicApi();

    const filter = filterOptional ? filterOptional : new BagFilter();

    const bags = api.listBags(
        storeName, limit, offset, ordering,
        filter.discovered.greaterThanEqual,
        filter.discovered.lowerThanEqual,
        filter.startTime.greaterThanEqual,
        filter.startTime.lowerThanEqual,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.keywordsToLikeString(filter.name),
        filter.tags ? filter.tags.join(",") : "",
        filter.trash);
    return bags.then((list) => { return list; });
  }

  public static getBagFromStore(storeName: string, bagName: string) {
    const api = ApiHelper.getBasicApi();
    return api.getBagMeta(storeName, bagName);
  }
}
