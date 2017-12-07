import * as _ from 'lodash';
import * as DCAT from './dcat';
import { bboxToGeoJSON, ensureMultiPolygon, wktToGeoJSON } from './utils';

export class Dataset {

  /**
   * Dataset metadata
   * @type  {DCAT.Dataset}
   */
  private _metadata: DCAT.Dataset;

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

  constructor(meta?: DCAT.Dataset) {
    if (meta) {
      this._metadata = meta;
    }
  }

  /**
   * Get a deep copy of the current dataset metadata.
   * @return {DCAT.Dataset} dataset metadata
   */
  public get(): DCAT.Dataset {
    return _.cloneDeep(this._metadata);
  }

  /**
   * Set the dataset metadata.
   * @param   {object}    meta dataset metadata
   * @return  {undefined}
   */
  public set(meta: object) {
    this._metadata = _.assign(this._metadata, meta);
  }

  /**
   * Create a dataset from a source metadata.
   * @param  {string} source source type
   * @param  {object} meta   source metadata
   * @return {Dataset}       Dataset object
   */
  public static from(source: string, meta: object): Dataset {
    const type = source.toLowerCase();

    if (!Dataset.convertor[type]) {
      throw new Error(`Unrecognized source: ${source}`);
    }

    return Dataset.convertor[type](meta);
  }

  /**
   * Create a dataset from an ArcGIS Open Data metadata.
   * @param  {object} meta   ArcGIS Open Data metadata
   * @return {Dataset}       Dataset object
   */
  private static fromArcGIS(meta: any): Dataset {
    // working with data.json API
    const converted = {
      title: meta.title,
      identifier: meta.identifier,
      issued: meta.issued ? new Date(meta.issued) : null,
      modified: new Date(meta.modified),
      description: meta.description,
      landingPage: meta.landingPage,
      license: meta.license,
      publisher: meta.publisher.name,
      keyword: meta.keyword,
      theme: [],
      spatial: bboxToGeoJSON(meta.spatial),
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
        title: file.title || file.name || file.format,
        description: file.description,
        accessURL: file.url,
        format: file.format
      };
    });

    const converted = {
      title: meta.title,
      identifier: meta.id,
      issued: meta.__extras ? new Date(meta.__extras.metadata_created) : new Date(meta.metadata_created),
      modified: meta.__extras ? new Date(meta.__extras.metadata_modified) : new Date(meta.metadata_modified),
      description: meta.notes,
      landingPage: meta.url || defaultValues.landingPage,
      license: meta.license_title,
      publisher: _.get(meta.organization, 'name') || defaultValues.publisher,
      keyword: _.map(meta.tags, 'display_name') as string[],
      theme: _.map(meta.groups, 'display_name') as string[],
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
    const distribution = meta.distribution.filter((dist) => dist.downloadURL || dist.accessURL);

    const converted = {
      title: meta.title,
      identifier: meta.identifier,
      issued: meta.issued ? new Date(getDateString(meta.issued)) : null,
      modified: meta.modified ? new Date(getDateString(meta.modified)) : null,
      description: meta.description,
      // TODO: this may be null
      landingPage: meta.landingPage || defaultValues.landingPage,
      license: meta.license,
      // TODO: this may be null
      publisher: meta.publisher ? meta.publisher.name : defaultValues.publisher,
      keyword: meta.keyword || [],
      theme: [],
      spatial: wktToGeoJSON(meta.spatial),
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
        description: meta.distribution_description,
        url: meta.distribution_url
      });
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
      spatial: wktToGeoJSON(meta.csw_wkt_geometry),
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
      description: meta.description,
      landingPage: meta.link,
      publisher: defaultValues.publisher,
      keyword: meta.tags,
      theme: [meta.category_name],
      distribution: [],
    };

    return new Dataset(converted);
  }

  /**
   * Create a dataset from a OpenDataSoft metadata.
   * @param  {object} meta            OpenDataSoft metadata
   * @return {Dataset}                Dataset object
   */
  private static fromOpenDataSoft(meta: any) {
    const converted = {
      title: meta.title,
      identifier: meta.dataset_id,
      modified: meta.modified ? new Date(meta.modified) : null,
      description: meta.description,
      landingPage: `https://${meta.source_domain_address}/explore/dataset/${meta.source_dataset}`,
      license: meta.license,
      publisher: meta.publisher,
      keyword: getValidArray(meta.keyword),
      theme: getValidArray(meta.theme),
      spatial: meta.geographic_area ? ensureMultiPolygon(meta.geographic_area.geometry) : null,
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

    const converted = {
      title: resource.name,
      identifier: resource.id,
      issued: new Date(resource.createdAt),
      modified: new Date(resource.updatedAt),
      description: resource.description,
      landingPage: meta.permalink || defaultValues.landingPage,
      license: _.get(meta.metadata, 'license') as string,
      publisher: meta.name,
      keyword: _.concat(_.get(meta.classification, 'tags'), _.get(meta.classification, 'domain_tags')) as string[],
      theme: _.concat(_.get(meta.classification, 'categories'), _.get(meta.classification, 'domain_category')) as string[],
      distribution: []  as DCAT.Distribution[]
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
