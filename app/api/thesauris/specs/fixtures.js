/* eslint-disable max-len */
import db from 'api/utils/testing_db';

const entityTemplateId = '589af97080fc0b23471d67f3';
const dictionaryId = '589af97080fc0b23471d67f4';
const dictionaryIdToTranslate = '589af97080fc0b23471d67f5';
const dictionaryWithValueGroups = db.id();
const dictionaryValueId = '1';

export default {
  dictionaries: [
    { _id: db.id(), name: 'dictionary' },
    { _id: db.id(dictionaryId), name: 'dictionary 2', values: [{ label: 'value 1' }, { label: 'value 2' }] },
    {
      _id: db.id(dictionaryIdToTranslate),
      name: 'Top 2 scify books',
      values: [
        { id: dictionaryValueId, label: 'Enders game' },
        { id: '2', label: 'Fundation' }
      ]
    },
    {
      _id: dictionaryWithValueGroups,
      name: 'Top movies',
      values: [
        {
          id: '1',
          label: 'scy fi',
          values: [
            { id: '1.1', label: 'groundhog day' },
            { id: '1.2', label: 'terminator 2' }
          ]
        },
        {
          id: '2',
          label: 'superheros',
          values: [
            { id: '2.1', label: 'batman' },
            { id: '2.2', label: 'spiderman' }
          ]
        },
        { id: '3', label: 'single value' },
      ]
    },
  ],
  templates: [
    { _id: db.id(entityTemplateId), name: 'entityTemplate', properties: [{}] },
    { _id: db.id(), name: 'documentTemplate', properties: [{}] }
  ],
  entities: [
    { _id: db.id(), sharedId: 'sharedId', type: 'entity', title: 'english entity', language: 'en', template: db.id(entityTemplateId), icon: 'Icon' },
    { _id: db.id(), sharedId: 'sharedId', type: 'entity', title: 'spanish entity', language: 'es', template: db.id(entityTemplateId), icon: 'Icon', published: true },
    { _id: db.id(), sharedId: 'other', type: 'entity', title: 'unpublished entity', language: 'es', template: db.id(entityTemplateId), published: false },
  ]
};

export {
  dictionaryId,
  dictionaryIdToTranslate,
  dictionaryValueId,
  dictionaryWithValueGroups
};
