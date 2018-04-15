import { expect } from 'chai';
import fetch, { RequestInit } from 'node-fetch';
import { Dataset } from '../src';

const requestOptions: RequestInit = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

describe('DCAT Dataset', function() {
  this.timeout(10000);

  it('should be able to be converted from ArcGIS metadata.', (done) => {
    // ArcGIS Open Data v2 API
    fetch('https://opendata.arcgis.com/api/v2/datasets?page[number]=1&page[size]=1', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        const dataset = Dataset.from('ArcGIS', res.data[0]);
        expect(dataset).to.be.an('object');
        done();
      })
      .catch((err) => done(err));
  });

  it('should be able to be converted from CKAN metadata', (done) => {
    // CKAN v3 API
    fetch('http://catalog.data.gov/api/3/action/package_search?rows=1&start=0', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        const dataset = Dataset.from('CKAN', res.result.results[0]);
        expect(dataset).to.be.an('object');
        done();
      })
      .catch((err) => done(err));
  });

  it('should be able to be converted from DKAN metadata', (done) => {
    // DKAN dataset API
    fetch('https://data.ca.gov/data.json', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        const dataset = Dataset.from('DKAN', res.dataset[0]);
        expect(dataset).to.be.an('object');
        done();
      })
      .catch((err) => done(err));
  });

  it('should be able to be converted from GeoNode metadata', (done) => {
    // GeoNode v2.4 API
    fetch('https://geonode.wfp.org/api/base?limit=1', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        const dataset = Dataset.from('GeoNode', res.objects[0]);
        expect(dataset).to.be.an('object');
        done();
      })
      .catch((err) => done(err));
  });

  it('should be able to be converted from Junar metadata', (done) => {
    // Junar v2 API
    fetch('http://saccounty.cloudapi.junar.com/api/v2/datasets.json?auth_key=47242a5ca37d49fc19a2b8440942865f6e82486b', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        const dataset = Dataset.from('Junar', res[0]);
        expect(dataset).to.be.an('object');
        done();
      })
      .catch((err) => done(err));
  });

  it('should be able to be converted from OpenDataSoft metadata', (done) => {
    // OpenDataSoft v2 API
    fetch('https://data.opendatasoft.com/api/v2/catalog/datasets?rows=1', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        const dataset = Dataset.from('OpenDataSoft', res.datasets[0]);
        expect(dataset).to.be.an('object');
        done();
      })
      .catch((err) => done(err));
  });

  it('should be able to be converted from Socrata metadata', (done) => {
    // Socrata v1 API
    fetch('http://api.us.socrata.com/api/catalog/v1?domains=data.seattle.gov&limit=1', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        const dataset = Dataset.from('Socrata', res.results[0]);
        expect(dataset).to.be.an('object');
        done();
      })
      .catch((err) => done(err));
  });
});
