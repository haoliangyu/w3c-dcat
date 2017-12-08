import { expect } from 'chai';
import fetch, { RequestInit } from 'node-fetch';
import { Dataset } from '../src';

const requestOptions: RequestInit = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

describe('DCAT Dataset', () => {

  it('should be able to be converted from ArcGIS', (done) => {
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

});
