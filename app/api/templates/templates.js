import entities from 'api/entities';
import request from 'shared/JSONRequest.js';
import translations from 'api/i18n/translations';
import validateTemplate from 'api/templates/validateTemplate';
import createError from 'api/utils/Error';

import { db_url as dbURL } from '../config/database.js';
import { generateNamesAndIds, getUpdatedNames, getDeletedProperties } from './utils';
import model from './templatesModel.js';

const checkDuplicated = template => model.get()
.then((templates) => {
  const duplicated = templates.find((entry) => {
    const sameEntity = entry._id.equals(template._id);
    const sameName = entry.name.trim().toLowerCase() === template.name.trim().toLowerCase();
    return sameName && !sameEntity;
  });

  if (duplicated) {
    return Promise.reject({ json: 'duplicated_entry' });
  }
});

const addTemplateTranslation = (template) => {
  const values = {};
  values[template.name] = template.name;
  template.properties.forEach((property) => {
    values[property.label] = property.label;
  });

  return translations.addContext(template._id, template.name, values, 'Entity');
};

const updateTranslation = (currentTemplate, template) => {
  const currentProperties = currentTemplate.properties;
  const newProperties = template.properties;

  const updatedLabels = getUpdatedNames(currentProperties, newProperties, 'label');
  if (currentTemplate.name !== template.name) {
    updatedLabels[currentTemplate.name] = template.name;
  }
  const deletedPropertiesByLabel = getDeletedProperties(currentProperties, newProperties, 'label');
  const context = template.properties.reduce((ctx, prop) => {
    ctx[prop.label] = prop.label;
    return ctx;
  }, {});

  context[template.name] = template.name;

  return translations.updateContext(currentTemplate._id, template.name, updatedLabels, deletedPropertiesByLabel, context, 'Entity');
};

export default {
  save(template, language) {
    template.properties = template.properties || [];
    template.properties = generateNamesAndIds(template.properties);
    return checkDuplicated(template)
    .then(() => validateTemplate(template))
    .then(() => {
      if (template._id) {
        return this._update(template, language);
      }
      return model.save(template)
      .then(newTemplate => addTemplateTranslation(newTemplate)
      .then(() => newTemplate));
    });
  },

  _update(template, language) {
    let _currentTemplate;
    return this.getById(template._id)
    .then((currentTemplate) => {
      currentTemplate.properties = currentTemplate.properties || [];
      currentTemplate.properties.forEach((prop) => {
        const swapingNameWithExistingProperty = template.properties.find(p => p.name === prop.name && p.id !== prop.id);
        if (swapingNameWithExistingProperty) {
          throw createError(`Properties can't swap names: ${prop.name}`, 400);
        }
      });

      return currentTemplate;
    })
    .then(currentTemplate => Promise.all([currentTemplate, updateTranslation(currentTemplate, template)]))
    .then(([currentTemplate]) => {
      _currentTemplate = currentTemplate;
      const currentTemplateContentProperties = currentTemplate.properties.filter(p => p.content);
      const templateContentProperties = template.properties.filter(p => p.content);
      const toRemoveValues = {};
      currentTemplateContentProperties.forEach((prop) => {
        const sameProperty = templateContentProperties.find(p => p.id === prop.id);
        if (sameProperty && sameProperty.content !== prop.content) {
          toRemoveValues[sameProperty.name] = prop.type === 'multiselect' ? [] : '';
        }
      });
      if (Object.keys(toRemoveValues).length === 0) {
        return;
      }
      return entities.removeValuesFromEntities(toRemoveValues, currentTemplate._id);
    })

    .then(() => model.save(template))
    .then(savedTemplate => entities.updateMetadataProperties(template, _currentTemplate, language)
    .then(() => savedTemplate));
  },

  get(query) {
    return model.get(query);
  },

  setAsDefault(templateId) {
    return this.get()
    .then((_templates) => {
      const templateToBeDefault = _templates.find(t => t._id.toString() === templateId);
      const currentDefault = _templates.find(t => t.default);
      templateToBeDefault.default = true;
      let saveCurrentDefault = Promise.resolve();
      if (currentDefault) {
        currentDefault.default = false;
        saveCurrentDefault = this.save(currentDefault);
      }

      return Promise.all([this.save(templateToBeDefault), saveCurrentDefault]);
    })
    .catch(console.log);
  },

  getById(templateId) {
    return model.getById(templateId);
  },

  delete(template) {
    return this.countByTemplate(template._id)
    .then((count) => {
      if (count > 0) {
        return Promise.reject({ key: 'documents_using_template', value: count });
      }
      return translations.deleteContext(template._id);
    })
    .then(() => model.delete(template._id))
    .then(() => template);
  },

  countByTemplate(template) {
    return entities.countByTemplate(template);
  },

  getEntitySelectNames(templateId) {
    return this.getById(templateId)
    .then((template) => {
      const selects = template.properties.filter(prop => prop.type === 'select' || prop.type === 'multiselect');
      const entitySelects = [];
      return Promise.all(selects.map(select => request.get(`${dbURL}/${select.content}`)
      .then((result) => {
        if (result.json.type === 'template') {
          entitySelects.push(select.name);
        }
      })))
      .then(() => entitySelects);
    });
  },

  countByThesauri(thesauriId) {
    return model.count({ 'properties.content': thesauriId });
  }
};
