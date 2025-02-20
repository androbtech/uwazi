import { browserHistory } from 'react-router';
import { actions as formActions } from 'react-redux-form';

import { actions } from 'app/BasicReducer';
import { notify } from 'app/Notifications';
import api from 'app/Pages/PagesAPI';
import * as types from 'app/Pages/actions/actionTypes';

export function resetPage() {
  return (dispatch) => {
    dispatch(formActions.reset('page.data'));
    dispatch(formActions.setInitial('page.data'));
  };
}

export function savePage(data) {
  return (dispatch) => {
    dispatch({ type: types.SAVING_PAGE });
    return api.save(data)
    .then((response) => {
      dispatch(notify('Saved successfully.', 'success'));
      dispatch(formActions.merge('page.data', { _id: response._id, sharedId: response.sharedId, _rev: response._rev }));
      dispatch({ type: types.PAGE_SAVED, data: response });
      browserHistory.push(`/settings/pages/edit/${response.sharedId}`);
    })
    .catch(() => {
      dispatch({ type: types.PAGE_SAVED, data: {} });
    });
  };
}

export function deletePage(page) {
  return dispatch => api.delete({ sharedId: page.sharedId })
  .then(() => {
    dispatch(actions.remove('pages', page));
  });
}
