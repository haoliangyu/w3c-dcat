/**
 * Represents a specific available form of a dataset. Each dataset might be
 * available in different forms, these forms might represent different formats
 * of the dataset or different endpoints. Examples of distributions include a
 * downloadable CSV file, an API or an RSS feed
 */
export class Distribution {

  /**
   * A name given to the distribution.
   * @type {string}
   */
  public title: string;

  /**
   * free-text account of the distribution.
   * @type {string}
   */
  public description?: string;

  /**
   * A landing page, feed, SPARQL endpoint or other type of resource that gives
   * access to the distribution of the dataset
   * @type {string}
   */
  public accessURL: string;

  /**
   * A file that contains the distribution of the dataset in a given format.
   * This url is not attached if there is no URL pointed to a file.
   * @type {string}
   */
  public downloadURL?: string;

  /**
   * The media type of the distribution as defined by IANA.
   * @type {string}
   */
  public mediaType?: string;

  /**
   * The file format of the distribution. This is only usable when the downloadURL exists.
   * @type {string}
   */
  public format?: string;
}
