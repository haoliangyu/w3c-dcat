import { MultiPolygon } from 'geojson';
import { Distribution } from './distribution';

/**
 * A collection of data, published or curated by a single agent, and available
 * for access or download in one or more formats.
 */
export class Dataset {

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
   * The language of the dataset.
   * @type {string}
   */
  public language?: string;

  /**
   * An entity responsible for making the dataset available.
   * @type {string}
   */
  public publisher: string;

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
   * @type {Array<string>}
   */
  public keyword: string[];

  /**
   * The main category of the dataset. A dataset can have multiple themes.
   * @type {Array<string>}
   */
  public theme: string[];

  /**
   * dataset files
   * @type {Array<Distribution>}
   */
  public distribution: Distribution[];

  /**
   * This links to the license document under which the distribution is made available.
   * @type {string}
   */
  public license?: string;

  /**
   * Spatial coverage of the dataset.
   * @type {MultiPolygon}
   */
  public spatial?: MultiPolygon|string;
}
