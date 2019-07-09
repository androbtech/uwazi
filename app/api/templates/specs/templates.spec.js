/* eslint-disable max-nested-callbacks */
/* eslint-disable max-statements */
import { catchErrors } from 'api/utils/jasmineHelpers';
import db from 'api/utils/testing_db';
import documents from 'api/documents/documents.js';
import entities from 'api/entities/entities.js';
import templates from 'api/templates/templates.js';
import translations from 'api/i18n/translations';

import fixtures, { templateToBeEditedId, templateToBeDeleted, templateWithContents } from './fixtures.js';


describe('templates', () => {
  beforeEach((done) => {
    spyOn(translations, 'addContext').and.returnValue(Promise.resolve());
    db.clearAllAndLoad(fixtures).then(done).catch(catchErrors(done));
  });

  afterAll((done) => {
    db.disconnect().then(done);
  });

  describe('save', () => {
    it('should return the saved template', (done) => {
      const newTemplate = { name: 'created_template', commonProperties: [{ name: 'title', label: 'Title' }], properties: [{ label: 'fieldLabel' }] };

      templates.save(newTemplate)
      .then((template) => {
        expect(template._id).toBeDefined();
        expect(template.name).toBe('created_template');
        done();
      })
      .catch(done.fail);
    });

    it('should create a template', (done) => {
      const newTemplate = { name: 'created_template', properties: [{ label: 'fieldLabel' }], commonProperties: [{ name: 'title', label: 'Title' }] };

      templates.save(newTemplate)
      .then(() => templates.get())
      .then((allTemplates) => {
        const newDoc = allTemplates.find(template => template.name === 'created_template');

        expect(newDoc.name).toBe('created_template');
        expect(newDoc.properties[0].label).toEqual('fieldLabel');
        done();
      })
      .catch(done.fail);
    });

    describe('when property content changes', () => {
      it('should remove the values from the entities and update them', (done) => {
        spyOn(translations, 'updateContext');
        spyOn(entities, 'removeValuesFromEntities');
        spyOn(entities, 'updateMetadataProperties').and.returnValue(Promise.resolve());
        const changedTemplate = {
          _id: templateWithContents,
          name: 'changed',
          commonProperties: [{ name: 'title', label: 'Title' }],
          properties:
          [{ id: '1', type: 'select', content: 'new_thesauri', label: 'select' },
          { id: '2', type: 'multiselect', content: 'new_thesauri', label: 'multiselect' }]
        };

        templates.save(changedTemplate)
        .then(() => {
          expect(entities.removeValuesFromEntities).toHaveBeenCalledWith({ select: '', multiselect: [] }, templateWithContents);
          done();
        })
        .catch(catchErrors(done));
      });
    });

    it('should validate properties not having repeated names and return an error', (done) => {
      const newTemplate = {
        name: 'created_template',
        commonProperties: [{ name: 'title', label: 'Title' }],
        properties: [
          { label: 'label 1' },
          { label: 'label 1' },
          { label: 'Label 2' },
          { label: 'label 2' },
          { label: 'label 3' }
        ]
      };

      templates.save(newTemplate)
      .then(() => done.fail('properties have repeated names, should have failed with an error'))
      .catch((error) => {
        expect(error).toEqual({ code: 400, message: 'duplicated_labels: label 1, label 2' });
        done();
      });
    });

    it('should validate properties not having the same label as the title', (done) => {
      const newTemplate = {
        name: 'created_template',
        commonProperties: [{ name: 'title', label: 'Name' }],
        properties: [
          { label: 'Label1' },
          { label: 'name' }
        ]
      };

      templates.save(newTemplate)
      .then(() => done.fail('properties have conflicting label with the title, should throw error'))
      .catch((err) => {
        expect(err).toEqual({ code: 400, message: 'duplicated_labels: name' });
        done();
      });
    });

    it('should validate properties not having repeated relationship fields', (done) => {
      const newTemplate = {
        name: 'created_template',
        commonProperties: [{ name: 'title', label: 'Title' }],
        properties: [
          { _id: 1, label: 'label 1', type: 'relationship', relationType: '1', content: '1' },
          { _id: 2, label: 'label 2', type: 'relationship', relationType: '1', content: '1' },
          { _id: 3, label: 'label 3', type: 'relationship', relationType: '1', content: '2' },
          { _id: 4, label: 'label 4', type: 'relationship', relationType: '2', content: '1' },
          { _id: 5, label: 'label 5', type: 'relationship', relationType: '3', content: '1' },
          { _id: 6, label: 'label 6', type: 'relationship', relationType: '3', content: '' }
        ]
      };

      templates.save(newTemplate)
      .then(() => done.fail('properties have repeated relationships, should have failed with an error'))
      .catch((error) => {
        expect(error).toEqual({ code: 400, message: 'duplicated_relationships: label 1, label 2, label 5, label 6' });
        done();
      });
    });

    it('should validate required inherited property', (done) => {
      const newTemplate = {
        name: 'created_template',
        commonProperties: [{ name: 'title', label: 'Title' }],
        properties: [
          { _id: 1, label: 'label 1', type: 'relationship', relationType: '1', inherit: true, content: '', inheritProperty: '' }
        ]
      };

      templates.save(newTemplate)
      .then(() => done.fail('properties have repeated relationships, should have failed with an error'))
      .catch((error) => {
        expect(error).toEqual({ code: 400, message: 'required_inherited_property: label 1' });
        done();
      });
    });

    it('should add it to translations with Entity type', (done) => {
      const newTemplate = {
        name: 'created template',
        commonProperties: [{ name: 'title', label: 'Title' }],
        properties: [
          { label: 'label 1' },
          { label: 'label 2' }
        ]
      };

      templates.save(newTemplate)
      .then((response) => {
        const expectedValues = {
            'created template': 'created template',
            Title: 'Title',
            'label 1': 'label 1',
            'label 2': 'label 2'
        };

        expect(translations.addContext).toHaveBeenCalledWith(response._id, 'created template', expectedValues, 'Entity');
        done();
      });
    });

    it('should assign a safe property name based on the label ', (done) => {
      const newTemplate = {
        name: 'created_template',
        commonProperties: [{ name: 'title', label: 'Title' }],
        properties: [
          { label: 'label 1', type: 'text' },
          { label: 'label 2', type: 'select' },
          { label: 'label 3', type: 'image' },
          { label: 'label 4', name: 'name', type: 'text' },
          { label: 'label 5', type: 'geolocation' }
        ]
      };

      templates.save(newTemplate)
      .then(() => templates.get())
      .then((allTemplates) => {
        const newDoc = allTemplates.find(template => template.name === 'created_template');

        expect(newDoc.properties[0].name).toEqual('label_1');
        expect(newDoc.properties[1].name).toEqual('label_2');
        expect(newDoc.properties[2].name).toEqual('label_3');
        expect(newDoc.properties[3].name).toEqual('label_4');
        expect(newDoc.properties[4].name).toEqual('label_5_geolocation');
        done();
      })
      .catch(catchErrors(done));
    });

    it('should set a default value of [] to properties', (done) => {
      const newTemplate = { name: 'created_template', commonProperties: [{ name: 'title', label: 'Title' }] };
      templates.save(newTemplate)
      .then(templates.get)
      .then((allTemplates) => {
        const newDoc = allTemplates.find(template => template.name === 'created_template');

        expect(newDoc.properties).toEqual([]);
        done();
      })
      .catch(done.fail);
    });

    describe('when passing _id', () => {
      beforeEach(() => {
        spyOn(entities, 'updateMetadataProperties').and.returnValue(Promise.resolve());
      });

      it('should updateMetadataProperties', (done) => {
        spyOn(translations, 'updateContext');
        const template = {
          _id: templateToBeEditedId,
          name: 'template to be edited',
          commonProperties: [{ name: 'title', label: 'Title' }],
          properties: [],
          default: true
        };
        const toSave = {
          _id: templateToBeEditedId,
          commonProperties: [{ name: 'title', label: 'Title' }],
          name: 'changed name'
        };
        templates.save(toSave, 'en')
        .then(() => {
          expect(entities.updateMetadataProperties).toHaveBeenCalledWith(toSave, template, 'en');
          done();
        })
        .catch(catchErrors(done));
      });

      it('should edit an existing one', (done) => {
        spyOn(translations, 'updateContext');
        const toSave = { _id: templateToBeEditedId, name: 'changed name', commonProperties: [{ name: 'title', label: 'Title' }] };
        templates.save(toSave)
        .then(templates.get)
        .then((allTemplates) => {
          const edited = allTemplates.find(template => template._id.toString() === templateToBeEditedId.toString());
          expect(edited.name).toBe('changed name');
          done();
        })
        .catch(catchErrors(done));
      });

      it('should update the translation context for it', (done) => {
        const newTemplate = {
          name: 'created template',
          commonProperties: [{ name: 'title', label: 'Title' }],
          properties: [{ label: 'label 1', type: 'text' }, { label: 'label 2', type: 'text' }]
        };
        spyOn(translations, 'updateContext');
        templates.save(newTemplate)
        .then((template) => {
          template.name = 'new title';
          template.properties[0].label = 'new label 1';
          template.properties.pop();
          template.properties.push({ label: 'label 3', type: 'text' });
          template.commonProperties[0].label = 'new title label';
          translations.addContext.calls.reset();
          return templates.save(template);
        })
        .then((response) => {
          expect(translations.addContext).not.toHaveBeenCalled();
          expect(translations.updateContext).toHaveBeenCalledWith(
            response._id,
            'new title',
            {
              'label 1': 'new label 1',
              'created template': 'new title'
            },
            ['label 2'],
            { 'new label 1': 'new label 1', 'label 3': 'label 3', 'new title': 'new title', 'new title label': 'new title label' },
            'Entity'
          );
          done();
        })
        .catch(done.fail);
      });

      it('should return the saved template', (done) => {
        spyOn(translations, 'updateContext');
        const edited = { _id: templateToBeEditedId, name: 'changed name', commonProperties: [{ name: 'title', label: 'Title' }] };
        return templates.save(edited)
        .then((template) => {
          expect(template.name).toBe('changed name');
          done();
        })
        .catch(done.fail);
      });
    });

    describe('when the template name exists', () => {
      it('should return the error', (done) => {
        const template = { name: 'duplicated name', commonProperties: [{ name: 'title', label: 'Title' }] };
        templates.save(template)
        .then(() => {
          done.fail('should return an error');
        })
        .catch((error) => {
          expect(error.json).toBe('duplicated_entry');
          done();
        });
      });
    });
  });

  describe('delete', () => {
    it('should delete a template when no document is using it', (done) => {
      spyOn(templates, 'countByTemplate').and.returnValue(Promise.resolve(0));
      return templates.delete({ _id: templateToBeDeleted })
      .then((response) => {
        expect(response).toEqual({ _id: templateToBeDeleted });
        return templates.get();
      })
      .then((allTemplates) => {
        const deleted = allTemplates.find(template => template.name === 'to be deleted');
        expect(deleted).not.toBeDefined();
        done();
      })
      .catch(catchErrors(done));
    });

    it('should delete the template translation', (done) => {
      spyOn(documents, 'countByTemplate').and.returnValue(Promise.resolve(0));
      spyOn(translations, 'deleteContext').and.returnValue(Promise.resolve());

      return templates.delete({ _id: templateToBeDeleted })
      .then(() => {
        expect(translations.deleteContext).toHaveBeenCalledWith(templateToBeDeleted);
        done();
      })
      .catch(catchErrors(done));
    });

    it('should throw an error when there is documents using it', (done) => {
      spyOn(templates, 'countByTemplate').and.returnValue(Promise.resolve(1));
      return templates.delete({ _id: templateToBeDeleted })
      .then(() => {
        done.fail('should not delete the template and throw an error because there is some documents associated with the template');
      })
      .catch((error) => {
        expect(error.key).toEqual('documents_using_template');
        expect(error.value).toEqual(1);
        done();
      });
    });
  });

  describe('countByThesauri()', () => {
    it('should return number of templates using a thesauri', (done) => {
      templates.countByThesauri('thesauri1')
      .then((result) => {
        expect(result).toBe(3);
        done();
      })
      .catch(catchErrors(done));
    });

    it('should return zero when none is using it', (done) => {
      templates.countByThesauri('not_used_relation')
      .then((result) => {
        expect(result).toBe(0);
        done();
      })
      .catch(catchErrors(done));
    });
  });

  describe('setAsDefault()', () => {
    beforeEach(() => {
      spyOn(translations, 'updateContext');
    });
    it('should set the given ID as the default template', (done) => {
      templates.setAsDefault(templateWithContents.toString())
      .then(([newDefault, oldDefault]) => {
        expect(newDefault.name).toBe('content template');
        expect(oldDefault.name).toBe('template to be edited');
        done();
      })
      .catch(catchErrors(done));
    });
  });
});
