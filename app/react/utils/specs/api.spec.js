import { browserHistory } from 'react-router';

import { APIURL } from 'app/config';
import { store } from 'app/store';
import api from 'app/utils/api';
import backend from 'fetch-mock';
import loadingBar from 'app/App/LoadingProgressBar';
import * as notifyActions from 'app/Notifications/actions/notificationsActions';

describe('api', () => {
  beforeEach(() => {
    spyOn(loadingBar, 'start');
    spyOn(loadingBar, 'done');
    backend.restore();
    backend
    .get(`${APIURL}test_get`, JSON.stringify({ method: 'GET' }))
    .post(`${APIURL}test_post`, JSON.stringify({ method: 'POST' }))
    .delete(`${APIURL}test_delete?data=delete`, JSON.stringify({ method: 'DELETE' }))
    .get(`${APIURL}unauthorised`, { status: 401, body: {} })
    .get(`${APIURL}notfound`, { status: 404, body: {} })
    .get(`${APIURL}error_url`, { status: 500, body: {} });
  });

  afterEach(() => backend.restore());

  describe('GET', () => {
    it('should prefix url with config api url', (done) => {
      api.get('test_get')
      .then((response) => {
        expect(response.json.method).toBe('GET');
        done();
      })
      .catch(done.fail);
    });

    it('should start and end the loading bar', (done) => {
      api.get('test_get')
      .then(() => {
        expect(loadingBar.done).toHaveBeenCalled();
        done();
      })
      .catch(done.fail);
      expect(loadingBar.start).toHaveBeenCalled();
    });

    describe('when authorizing', () => {
      it('should send the authorization cookie in the headers', (done) => {
        api.cookie('cookie');
        api.get('test_get')
        .then(() => {
          const { headers } = backend.calls()[0][1];
          expect(headers.Cookie).toBe('cookie');

          done();
        })
        .catch(done.fail);
      });
    });
  });

  describe('POST', () => {
    it('should prefix url with config api url', (done) => {
      api.post('test_post', { data: 'post' })
      .then((response) => {
        expect(backend.calls()[0][1].body).toBe(JSON.stringify({ data: 'post' }));
        expect(response.json.method).toBe('POST');
        done();
      })
      .catch(done.fail);
    });

    it('should start and end the loading bar', (done) => {
      api.post('test_post', { data: 'post' })
      .then(() => {
        expect(loadingBar.done).toHaveBeenCalled();
        done();
      })
      .catch(done.fail);
      expect(loadingBar.start).toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('should prefix url with config api url', (done) => {
      api.delete('test_delete', { data: 'delete' })
      .then((response) => {
        expect(response.json.method).toBe('DELETE');
        done();
      })
      .catch(done.fail);
    });

    it('should start and end the loading bar', (done) => {
      api.delete('test_delete', { data: 'delete' })
      .then(() => {
        expect(loadingBar.done).toHaveBeenCalled();
        done();
      })
      .catch(done.fail);
      expect(loadingBar.start).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    describe('401', () => {
      it('should redirect to login', (done) => {
        spyOn(browserHistory, 'replace');
        api.get('unauthorised')
        .catch(() => {
          expect(browserHistory.replace).toHaveBeenCalledWith('/login');
          done();
        });
      });
    });

    describe('404', () => {
      it('should redirect to login', (done) => {
        spyOn(browserHistory, 'replace');
        api.get('notfound')
        .catch(() => {
          expect(browserHistory.replace).toHaveBeenCalledWith('/404');
          done();
        });
      });
    });

    it('should notify the user', (done) => {
      spyOn(store, 'dispatch');
      spyOn(notifyActions, 'notify').and.returnValue('notify action');
      api.get('error_url')
      .catch(() => {
        expect(store.dispatch).toHaveBeenCalledWith('notify action');
        expect(notifyActions.notify).toHaveBeenCalledWith('An error has occurred', 'danger');
        done();
      });
    });

    it('should end the loading bar', (done) => {
      api.get('error_url')
      .catch(() => {
        expect(loadingBar.done).toHaveBeenCalled();
        done();
      });
    });
  });
});
