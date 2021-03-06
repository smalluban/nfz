import rp from 'request-promise';
import queryString from 'query-string';
import { API_URL } from './consts';

const DEFAULT_OPTIONS = {
  ROK: '',
  OW: '01',
  ServiceType: '',
  Code: '',
  Name: '',
  City: '',
  Nip: '',
  Regon: '',
  Product: '',
  OrthopedicSupply: 'false',
  page: 1,
};

const DEFAULT_REQ_OPTIONS = {
  agent: false,
  forever: true,
  timeout: 300 * 1000, // ms
};

export function getSearchResult(options = {}) {
  const query = Object.assign({}, DEFAULT_OPTIONS, options);
  const url = `${API_URL}/umowy/Provider/Index?${queryString.stringify(query)}`;

  return rp(Object.assign({}, DEFAULT_REQ_OPTIONS, { url })).catch((e) => {
    console.error(url);
    throw e;
  });
}

export function getProviderResult(relativeURL) {
  const url = `${API_URL}${relativeURL}`;
  return rp(Object.assign({}, DEFAULT_REQ_OPTIONS, { url }));
}
