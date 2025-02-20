/* eslint-disable max-len */
import db from 'api/utils/testing_db';

const userId = db.id();

const template1 = db.id();
const template2 = db.id();
const template3 = db.id();
const template4 = db.id();
const template5 = db.id();

const template1Metadata1 = db.id();
const template1Metadata2 = db.id();
const template2Metadata1 = db.id();

const relationType1 = db.id();

const hub1 = db.id();
const hub2 = db.id();
const hub3 = db.id();
const hub4 = db.id();
const hub5 = db.id();
const hub6 = db.id();

export default {
  entities: [
    {
      _id: db.id(),
      sharedId: 'entity01',
      template: template1,
      language: 'en',
      title: 'Entity with two geolocations en',
      metadata: {
        home_geolocation: [{ lat: 13, lon: 7, label: '' }],
        work_geolocation: [{ lat: 23, lon: 8, label: '' }],
      },
      published: true,
      user: userId
    }, {
      _id: db.id(),
      sharedId: 'entity02',
      template: template1,
      language: 'en',
      title: 'Entity not always inherited en',
      metadata: {
        home_geolocation: [{ lat: 111, lon: 222, label: '' }],
        work_geolocation: [{ lat: 333, lon: 444, label: '' }]
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity03',
      template: template1,
      language: 'en',
      title: 'Entity with single geolocation en',
      metadata: {
        home_geolocation: [{ lat: 5, lon: 10, label: '' }]
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity04',
      template: template1,
      language: 'en',
      title: 'Entity without geolocation en',
      metadata: {},
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity04.1',
      template: template1,
      language: 'en',
      title: 'entity without metadata',
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity05',
      template: template2,
      language: 'en',
      title: 'Country A en',
      metadata: {
        country_geolocation: [{ lat: 23, lon: 7, label: '' }]
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity06',
      template: template2,
      language: 'en',
      title: 'Country A en',
      metadata: {
        country_geolocation: [null]
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity07',
      template: template3,
      language: 'en',
      title: 'Complex inherited entity en',
      metadata: {
        text: 'Text content',
        regular_geolocation_geolocation: [{ lat: 18, lon: 7 }],
        regular_relationship: ['entity02'],
        inhertied_country: ['entity06'],
        inhertied_home: ['entity01', 'entity03', 'entity04', 'entity04.1']
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity08',
      template: template3,
      language: 'en',
      title: 'Simple inherited entity en',
      metadata: {
        text: 'Text content',
        inhertied_home: ['entity02', 'noExiste']
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity_shouldNotAppearInGeolocation',
      template: template3,
      language: 'en',
      title: 'Entity that should not appear in geolocation searches en',
      metadata: {},
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity09',
      template: template4,
      language: 'en',
      title: 'Entity with other property inherited en',
      metadata: {
        text: 'Text content',
        inhertied_work: ['entity01']
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity10',
      template: template4,
      language: 'en',
      title: 'Entity linking a null en',
      metadata: {
        inhertied_work: ['entity06']
      },
      published: true,
      user: userId
    },
    {
      _id: db.id(),
      sharedId: 'entity011',
      template: template5,
      language: 'en',
      title: 'Entity without geolocations en',
      metadata: {
        just_text: 'Text content'
      },
      published: true,
      user: userId
    }
  ],
  templates: [
    {
      _id: template1,
      properties: [
        { _id: db.id(), name: 'text', type: 'text' },
        {
          _id: template1Metadata1,
          name: 'home_geolocation',
          type: 'geolocation'
        },
        {
          _id: template1Metadata2,
          name: 'work_geolocation',
          type: 'geolocation'
        }
      ]
    },
    {
      _id: template2,
      properties: [
        {
          _id: template2Metadata1,
          name: 'country_geolocation',
          type: 'geolocation'
        }
      ]
    },
    {
      _id: template3,
      properties: [
        { _id: db.id(), name: 'text', type: 'text' },
        {
          _id: db.id(),
          name: 'regular_geolocation_geolocation',
          type: 'geolocation'
        },
        {
          _id: db.id(),
          name: 'regular_relationship',
          type: 'relationship',
          relationType: relationType1
        },
        {
          _id: db.id(),
          name: 'inhertied_country',
          type: 'relationship',
          relationType: relationType1,
          content: template2,
          inherit: true,
          inheritProperty: template2Metadata1
        },
        {
          _id: db.id(),
          name: 'inhertied_home',
          type: 'relationship',
          relationType: relationType1,
          content: template1,
          inherit: true,
          inheritProperty: template1Metadata1
        }
      ]
    },
    {
      _id: template4,
      properties: [
        {
          _id: db.id(),
          name: 'inhertied_work',
          type: 'relationship',
          relationType: relationType1,
          content: template1,
          inherit: true,
          inheritProperty: template1Metadata2
        }
      ]
    },
    {
      _id: template5,
      properties: [{ _id: db.id(), name: 'just_text', type: 'text' }]
    }
  ],
  relationtypes: [
    {
      _id: relationType1,
      name: 'relation1',
      properties: []
    }
  ],
  connections: [
    { hub: hub1, entity: 'entity07', template: relationType1 },
    { hub: hub1, entity: 'entity02', template: relationType1 },

    { hub: hub2, entity: 'entity07', template: relationType1 },
    { hub: hub2, entity: 'entity06', template: relationType1 },

    { hub: hub3, entity: 'entity07', template: relationType1 },
    { hub: hub3, entity: 'entity01', template: relationType1 },
    { hub: hub3, entity: 'entity03', template: relationType1 },
    { hub: hub3, entity: 'entity04', template: relationType1 },

    { hub: hub4, entity: 'entity08', template: relationType1 },
    { hub: hub4, entity: 'entity02', template: relationType1 },

    { hub: hub5, entity: 'entity09', template: relationType1 },
    { hub: hub5, entity: 'entity01', template: relationType1 },

    { hub: hub6, entity: 'entity10', template: relationType1 },
    { hub: hub6, entity: 'entity06', template: relationType1 }
  ]
};

export const ids = {
  template3
};
