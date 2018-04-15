import * as _ from "lodash";
import * as DCAT from "./dcat";
import { MultiPolygon } from "geojson";
import {
  bboxToGeoJSON,
  ensureMultiPolygon,
  wktToGeoJSON,
  detectLanguage
} from "./utils";

export enum Type {
  Catalog = "dcat:Catalog",
  Dataset = "dcat:Dataset",
  Distribution = "dcat:Distribution"
}

export class Dataset implements DCAT.Dataset {
  /**
   * DCAT class
   * @type {string}
   */
  public "@type": Type = Type.Dataset;

  /**
   * A name given to the dataset.
   * @type {string}
   */
  public title: string;

  /**
   * Free-text account of the dataset.
   * @type {string}
   */
  public description?: string;

  /**
   * Date of formal issuance (e.g., publication) of the dataset.
   * @type {Date}
   */
  public issued?: Date;

  /**
   * Most recent date on which the dataset was changed, updated or modified.
   * @type {Date}
   */
  public modified?: Date;

  /**
   * The language of the catalog. This refers to the language used in the textual
   * metadata describing titles, descriptions, etc. of the datasets in the catalog.
   * @type {string[]}
   */
  public language?: string[];

  /**
   * An entity responsible for making the dataset available.
   * @type {string}
   */
  public publisher: string;

  /**
   * The frequency at which dataset is published.
   * @type {string}
   */
  public accrualPeriodicity?: string;

  /**
   * A unique identifier of the dataset.
   * @type {string}
   */
  public identifier: string;

  /**
   * A Web page that can be navigated to in a Web browser to gain access to the
   * dataset, its distributions and/or additional information.
   * @type {string}
   */
  public landingPage: string;

  /**
   * A keyword or tag describing the dataset.
   * @type {string[]}
   */
  public keyword: string[];

  /**
   * The main category of the dataset. A dataset can have multiple themes.
   * @type {string[]}
   */
  public theme: string[];

  /**
   * dataset files
   * @type {Distribution[]}
   */
  public distribution: DCAT.Distribution[];

  /**
   * This links to the license document under which the distribution is made available.
   * @type {string}
   */
  public license?: string;

  /**
   * Spatial coverage of the dataset.
   * @type {MultiPolygon|string}
   */
  public spatial?: MultiPolygon | string;

  /**
   * Metadata convertor
   * @type  {object}
   */
  private static convertor: object = {
    arcgis: Dataset.fromArcGIS,
    ckan: Dataset.fromCKAN,
    dkan: Dataset.fromDKAN,
    geonode: Dataset.fromGeoNode,
    junar: Dataset.fromJunar,
    opendatasoft: Dataset.fromOpenDataSoft,
    socrata: Dataset.fromSocrata
  };

  constructor(meta?: any) {
    if (meta) {
      this.set(meta);
    }
  }

  /**
   * Get a deep copy of the current dataset metadata.
   * @return {DCAT.Dataset} dataset metadata
   */
  public toJSON(): DCAT.Dataset {
    return _.cloneDeep(this as DCAT.Dataset);
  }

  /**
   * Set the dataset metadata.
   * @param   {any}    meta dataset metadata
   * @return  {undefined}
   */
  public set(meta: any) {
    _.assign(this, meta);

    // any update about text
    if (
      !meta.language &&
      (meta.title ||
        meta.description ||
        _.get(meta, "keyword.length") > 0 ||
        _.get(meta, "theme.length") > 0)
    ) {
      this.language = [detectLanguage(this)];
    }
  }

  /**
   * Create a dataset from a source metadata.
   * @param  {string} source source type
   * @param  {object} meta   source metadata
   * @return {Dataset}       Dataset object
   */
  public static from(source: string, meta: any): Dataset {
    const type = source.toLowerCase();

    if (!Dataset.convertor[type]) {
      throw new Error(`Unrecognized source: ${source}`);
    }

    return Dataset.convertor[type](meta);
  }

  /**
   * Create a dataset from an ArcGIS Open Data metadata. Currently working with
   * v2 API.
   * @param  {object} meta   ArcGIS Open Data metadata
   * @return {Dataset}       Dataset object
   */
  private static fromArcGIS(meta: any): Dataset {
    const attrs = meta.attributes;
    const converted = {
      title: attrs.title || attrs.name,
      identifier: meta.id,
      issued: new Date(attrs.createdAt),
      modified: new Date(attrs.updatedAt),
      description: attrs.description,
      landingPage: attrs.landingPage,
      license: attrs.licenseInfo,
      publisher: attrs.source || attrs.owner,
      keyword: attrs.tags,
      theme: [],
      spatial: bboxToGeoJSON(attrs.extent.coordinates),
      distribution: meta.distribution
    };

    return new Dataset(converted);
  }

  /**
   * Create a dataset from a CAKN metadata.
   * @param  {object} meta            CKAN metadata
   * @param  {object} [defaultValues] default metadata values
   * @return {Dataset}                Dataset object
   */
  private static fromCKAN(meta: any, defaultValues: any = {}) {
    const distribution = _.map(meta.resources, (file: any) => {
      return {
        "@type": Type.Distribution,
        title: file.title || file.name || file.format,
        description: file.description,
        accessURL: file.url,
        format: file.format
      };
    });

    const converted = {
      title: meta.title,
      identifier: meta.id,
      issued: meta.__extras
        ? new Date(meta.__extras.metadata_created)
        : new Date(meta.metadata_created),
      modified: meta.__extras
        ? new Date(meta.__extras.metadata_modified)
        : new Date(meta.metadata_modified),
      description: meta.notes,
      landingPage: meta.url || defaultValues.landingPage,
      license: meta.license_title,
      publisher: _.get(meta.organization, "name") || defaultValues.publisher,
      keyword: _.map(meta.tags, "display_name") as string[],
      theme: _.map(meta.groups, "display_name") as string[],
      distribution
    };

    return new Dataset(converted);
  }

  /**
   * Create a dataset from a DKAN metadata.
   * @param  {object} meta            DKAN metadata
   * @param  {object} [defaultValues] default metadata values
   * @return {Dataset}                Dataset object
   */
  private static fromDKAN(meta: any, defaultValues: any = {}) {
    const distribution = meta.distribution.filter(
      dist => dist.downloadURL || dist.accessURL
    );

    const converted = {
      title: meta.title,
      identifier: meta.identifier,
      issued: meta.issued ? new Date(getDateString(meta.issued)) : null,
      modified: meta.modified ? new Date(getDateString(meta.modified)) : null,
      description: meta.description,
      landingPage: meta.landingPage || defaultValues.landingPage,
      license: meta.license,
      publisher: meta.publisher ? meta.publisher.name : defaultValues.publisher,
      keyword: meta.keyword || [],
      theme: [],
      language: meta.language,
      spatial: wktToGeoJSON(meta.spatial),
      accrualPeriodicity: meta.accrualPeriodicity,
      distribution
    };

    return new Dataset(converted);
  }

  /**
   * Create a dataset from a GeoNode metadata.
   * @param  {object} meta            GeoNode metadata
   * @param  {object} [defaultValues] default metadata values
   * @return {Dataset}                Dataset object
   */
  private static fromGeoNode(meta: any, defaultValues: any = {}) {
    const distribution = [];

    if (meta.distribution_description && meta.distribution_url) {
      distribution.push({
        "@type": Type.Distribution,
        description: meta.distribution_description,
        url: meta.distribution_url
      });
    }

    let spatial;

    try {
      spatial = wktToGeoJSON(meta.csw_wkt_geometry);
    } catch (error) {
      // The GeoNode site may include bad input for the WKT. Skip it.
      console.error(error);
    }

    const converted = {
      title: meta.title,
      identifier: meta.uuid,
      modified: new Date(meta.date),
      description: meta.abstract,
      landingPage: meta.distribution_url || defaultValues.landingPage,
      publisher: defaultValues.name,
      keyword: [],
      theme: [meta.category__gn_description],
      spatial,
      distribution
    };

    return new Dataset(converted);
  }

  /**
   * Create a dataset from a GeoNode metadata.
   * @param  {object} meta            GeoNode metadata
   * @param  {object} [defaultValues] default metadata values
   * @return {Dataset}                Dataset object
   */
  private static fromJunar(meta: any, defaultValues: any = {}) {
    const issued = new Date();
    const modified = new Date();

    issued.setTime(meta.created_at * 1000);
    modified.setTime(meta.modified_at * 1000);

    const converted = {
      title: meta.title,
      identifier: meta.guid,
      issued,
      modified,
      accrualPeriodicity: meta.frequency,
      description: meta.description,
      landingPage: meta.link,
      publisher: defaultValues.publisher,
      keyword: meta.tags,
      theme: [meta.category_name],
      distribution: []
    };

    return new Dataset(converted);
  }

  /**
   * Create a dataset from a OpenDataSoft metadata.
   * @param  {object} meta            OpenDataSoft metadata
   * @return {Dataset}                Dataset object
   */
  private static fromOpenDataSoft(meta: any) {
    const dataset = meta.dataset;
    const attrs = dataset.metas.default;

    const converted = {
      title: attrs.title,
      identifier: dataset.dataset_id,
      modified: attrs.modified ? new Date(attrs.modified) : null,
      description: attrs.description,
      landingPage: `https://${attrs.source_domain_address}/explore/dataset/${
        attrs.source_dataset
      }/information/`,
      license: attrs.license,
      language: attrs.language,
      publisher: attrs.publisher,
      keyword: getValidArray(attrs.keyword),
      theme: getValidArray(attrs.theme),
      spatial: attrs.geographic_area
        ? ensureMultiPolygon(attrs.geographic_area.geometry)
        : null,
      distribution: []
    };

    return new Dataset(converted);
  }

  /**
   * Create a dataset from a Socrata metadata.
   * @param  {object} meta            Socrata metadata
   * @param  {object} [defaultValues] default metadata values
   * @return {Dataset}                Dataset object
   */
  private static fromSocrata(meta: any, defaultValues: any = {}) {
    const resource = meta.resource;

    let publisher;
    let accrualPeriodicity;

    if (_.has(meta, "classification.domain_metadata")) {
      publisher = _.find(meta.classification.domain_metadata, {
        key: "Data-Owner_Owner"
      });

      if (publisher) {
        publisher = publisher.value;
      }

      accrualPeriodicity = _.find(meta.classification.domain_metadata, {
        key: "Refresh-Frequency_Frequency"
      });

      if (accrualPeriodicity) {
        accrualPeriodicity = accrualPeriodicity.value;
      }
    }

    const converted = {
      title: resource.name,
      identifier: resource.id,
      issued: new Date(resource.createdAt),
      modified: new Date(resource.updatedAt),
      description: resource.description,
      landingPage: meta.permalink || defaultValues.landingPage,
      license: _.get(meta, "metadata.license") as string,
      publisher: publisher || meta.attribution,
      accrualPeriodicity,
      keyword: _.concat(
        _.get(meta, "classification.tags"),
        _.get(meta, "classification.domain_tags")
      ) as string[],
      theme: _.concat(
        _.get(meta, "classification.categories"),
        _.get(meta, "classification.domain_category")
      ) as string[],
      distribution: []
    };

    return new Dataset(converted);
  }
}

function getDateString(raw) {
  if (raw.match(/\d{4}-\d{2}-\d{2}/)) {
    return raw;
  }

  const match = raw.search(/\d{2}\/\d{2}\/\d{4}/);

  if (match > -1) {
    return raw.substr(match, 10);
  }
}

function getValidArray(array) {
  if (_.isArray(array)) {
    return array;
  } else if (array && _.isString(array)) {
    return [array];
  }

  return [];
}
