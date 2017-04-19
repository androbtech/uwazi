import {combineReducers} from 'redux';

import documents from './documentsReducer';
import libraryUI from './uiReducer';
import libraryFilters from './filtersReducer';
import createReducer from 'app/BasicReducer';

import {modelReducer, formReducer} from 'react-redux-form';

export default combineReducers({
  aggregations: createReducer('aggregations', {}),
  documents: documents,
  ui: libraryUI,
  filters: libraryFilters,
  //
  sidepanel: combineReducers({
    metadata: modelReducer('library.sidepanel.metadata', {}),
    metadataForm: formReducer('library.sidepanel.metadata', {}),
    multipleEdit: modelReducer('library.sidepanel.multipleEdit', {}),
    multipleEditForm: formReducer('library.sidepanel.multipleEdit', {}),
    references: createReducer('library.sidepanel.references', []),
    tab: createReducer('library.sidepanel.tab', '')
  })
});
