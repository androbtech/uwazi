import HtmlParser from 'htmlparser2/lib/Parser';
import queryString from 'query-string';
import rison from 'rison';
import Big from 'big.js';

import searchApi from 'app/Search/SearchAPI';
import entitiesApi from 'app/Entities/EntitiesAPI';

let undefinedValue;

const conformUrl = ({ url = '', geolocation = false }) => {
  const { q } = queryString.parse(url.substring(url.indexOf('?')));
  if (!q) {
    const defaultValue = { allAggregations: true, limit: 0 };
    if (geolocation) {
      defaultValue.geolocation = true;
    }

    return defaultValue;
  }

  const params = rison.decode(q);
  params.limit = 0;

  if (geolocation) {
    params.geolocation = true;
  }

  return params;
};

const conformValues = attribs => attribs.entity ? attribs : conformUrl(attribs);

const parseDatasets = (markdown) => {
  const result = {};
  const parser = new HtmlParser({
      onopentag(name, attribs) {
        if (name === 'dataset') {
          result[attribs.name || 'default'] = conformValues(attribs);
        }
      }
  }, { decodeEntities: true });

  parser.parseComplete(markdown);
  return result;
};

const requestDatasets = datasets => Promise.all(
  Object.keys(datasets)
  .map(
    (name) => {
      const apiAction = datasets[name].entity ? entitiesApi.get : searchApi.search;
      const params = datasets[name].entity ? datasets[name].entity : datasets[name];
      const postAction = datasets[name].entity ? d => d[0] : d => d;
      return apiAction(params).then(postAction).then(data => ({ data, name }));
    }
  )
);

const conformDatasets = sets => sets.reduce((memo, set) => Object.assign({}, memo, { [set.name]: set.data }), {});

const getAggregations = (state, { property, dataset = 'default' }) => {
  const data = state.page.datasets.get(dataset);
  return !data ? undefinedValue : data.getIn(['aggregations', 'all', property, 'buckets']);
};

const addValues = (aggregations, values) => {
  let result = new Big(0);
  values.forEach((key) => {
    const value = aggregations.find(bucket => bucket.get('key') === key);
    const filteredValue = value ? value.getIn(['filtered', 'doc_count']) : 0;
    result = result.plus(filteredValue || 0);
  });
  return Number(result);
};

export default {
  async fetch(markdown) {
    const datasets = parseDatasets(markdown);
    return requestDatasets(datasets).then(conformDatasets);
  },

  getRows(state, { dataset = 'default' }) {
    const data = state.page.datasets.get(dataset);
    if (!data) { return undefinedValue; }
    return data.get('rows');
  },

  getAggregations,

  getAggregation(state, { uniqueValues, property, value, dataset = 'default' }) {
    const aggregations = getAggregations(state, { property, dataset });
    if (!aggregations) {
      return undefinedValue;
    }

    if (uniqueValues) {
      return aggregations.filter(a => a.getIn(['filtered', 'doc_count']) !== 0).size;
    }

    const values = value ? value.split(',') : [''];
    return addValues(aggregations, values);
  },

  getMetadataValue(state, { property, dataset = 'default' }) {
    const data = state.page.datasets.get(dataset);
    return !data ? undefinedValue : Number(data.getIn(['metadata', property]));
  }
};
