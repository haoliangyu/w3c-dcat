# w3c-dcat

[![Build Status](https://travis-ci.org/haoliangyu/w3c-dcat.svg?branch=master)](https://travis-ci.org/haoliangyu/w3c-dcat)

A utility library to create and convert [W3C DCAT](https://www.w3.org/TR/vocab-dcat/) in JSON.

Primarily developed for [SingularData.net](https://github.com/SingularData/SingularData.net)

## Installation

``` bash
npm install w3c-dcat
```

## Use

Support DCAT spec:
  * [Dataset](https://www.w3.org/TR/vocab-dcat/#class-dataset)

``` javascript
import { Dataset } from 'w3c-dcat';

// create a new dataset class
const datasetA = new Dataset();

// create a new dataset with predefined value
const datasetB = new Dataset(values);

// extend the dataset metadata with an key-value object
datasetA.set(values);

// get a value-only copy of the dataset metadata
console.log(datasetB.get())

// get a DCAT datset class from other open data vendor's dataset metadata
const datasetC = Dataset.from('ArcGIS', metadata)

```

[TypeScript](https://www.typescriptlang.org/) is natively supported. For more examples, please see [tests](https://github.com/haoliangyu/w3c-dcat/blob/master/test/index.test.ts) and [documentation](https://haoliangyu.github.io/w3c-dcat/).

### Supported Vendor

`w3c-dcat` is able to convert dataset metadata from the following open data vendors:
* [ArcGIS](https://hub.arcgis.com/pages/open-data) (v2 API)
* [CKAN](https://ckan.org/) (v3 API)
* [DKAN](https://getdkan.org/)
* [GeoNode](http://geonode.org/)
* [Junar](http://www.junar.com/index9ed2.html?lang=en) (v2 API)
* [OpenDataSoft](https://www.opendatasoft.com/) (v2 API)
* [Socrata](https://socrata.com/solutions/open-data-citizen-engagement/) (v1 API)

## License

MIT
