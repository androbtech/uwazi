import db from 'api/utils/testing_db';
import { search } from 'api/search';
import instanceElasticTesting from 'api/utils/elastic_testing';

import inheritanceFixtures, { ids } from './fixturesInheritance';

describe('search.searchGeolocations', () => {
  const elasticTesting = instanceElasticTesting('search.geolocation_index_test');

  beforeAll(async () => {
    await db.clearAllAndLoad(inheritanceFixtures);
    await elasticTesting.reindex();
  });

  afterAll((done) => {
    db.disconnect().then(done);
  });

  const cleanResults = results => results.rows.reduce((_memo, row) => {
    const memo = _memo;
    const { sharedId, metadata } = row;
    memo.push({ sharedId, metadata });
    return memo;
  }, []);

  it('should include all geolocation finds, inheriting metadata', async () => {
    const results = await search.searchGeolocations({ order: 'asc', sort: 'sharedId' }, 'en');
    expect(cleanResults(results)).toMatchSnapshot();
  });

  it('should allow filtering as in normal search', async () => {
    const results = await search.searchGeolocations({ types: [ids.template3], order: 'asc', sort: 'sharedId' }, 'en');
    expect(cleanResults(results)).toMatchSnapshot();
  });
});
