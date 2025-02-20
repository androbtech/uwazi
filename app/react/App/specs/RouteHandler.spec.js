/* eslint-disable max-statements */
import React from 'react';
import backend from 'fetch-mock';
import 'jasmine-immutablejs-matchers';
import { shallow } from 'enzyme';
import Immutable from 'immutable';
import moment from 'moment';

import api from 'app/utils/api';
import { I18NUtils } from 'app/I18N';

import RouteHandler from '../RouteHandler';
import config from '../../config.js';

class TestController extends RouteHandler {
  static requestState(params) {
    return Promise.resolve({ initialData: params.id });
  }

  setReduxState(params) {
    this.setReduxStateCalledWith = params;
  }

  render() {
    return <div />;
  }
}

describe('RouteHandler', () => {
  let component;
  let instance;
  const routeParams = { id: '123' };
  const location = { pathname: '', query: 'url query' };
  const languages = [
    { key: 'en', label: 'English', default: true },
    { key: 'es', label: 'Español' }
  ];
  let state;

  const context = { store: { getState: () => state, dispatch: jasmine.createSpy('dispatch') } };

  beforeEach(() => {
    spyOn(api, 'locale');
    spyOn(I18NUtils, 'saveLocale');

    state = {
      settings: { collection: Immutable.fromJS({ languages }) },
      user: Immutable.fromJS({}),
      templates: 'templates',
      thesauris: 'thesauris',
      locale: 'de',
    };

    backend.restore();
    backend
    .get(`${config.APIURL}templates`, { body: JSON.stringify({ rows: [] }) });
    delete window.__initialData__;

    spyOn(TestController, 'requestState').and.callThrough();

    RouteHandler.renderedFromServer = false;
    component = shallow(<TestController params={routeParams} location={location} routes={[{ path: '' }]}/>, { context });
    instance = component.instance();
    instance.constructor = TestController;
  });

  afterEach(() => backend.restore());

  describe('static requestState', () => {
    it('should return a promise with an empty object', (done) => {
      RouteHandler.requestState()
      .then((response) => {
        expect(response).toEqual({});
        done();
      })
      .catch(done.fail);
    });
  });

  describe('on instance', () => {
    beforeEach((done) => {
      setTimeout(() => { done(); });
    });

    it('should request for initialState and setReduxState, with the state', () => {
      expect(TestController.requestState).toHaveBeenCalledWith(routeParams, location.query, state);
      expect(instance.setReduxStateCalledWith).toEqual({ initialData: '123' });
    });

    it('should set the locales of the different stores and services', () => {
      expect(moment.locale()).toBe('de');
      expect(api.locale).toHaveBeenCalledWith('de');
      expect(I18NUtils.saveLocale).toHaveBeenCalledWith('de');
    });
  });

  describe('componentWillReceiveProps', () => {
    let props;
    beforeEach(() => {
      props = { params: { id: '456' }, location: { pathname: '/es', query: '' }, routes: [{ path: '' }] };
    });

    describe('when params change', () => {
      it('should request the clientState', () => {
        spyOn(instance, 'getClientState');
        instance.componentWillReceiveProps(props);
        expect(instance.getClientState).toHaveBeenCalledWith(props);
      });

      it('should call emptyState', () => {
        spyOn(instance, 'emptyState');
        instance.componentWillReceiveProps(props);
        expect(instance.emptyState).toHaveBeenCalled();
      });
    });

    describe('when path changes', () => {
      it('should request the clientState', () => {
        spyOn(instance, 'getClientState');
        props = { params: { ...routeParams }, location, routes: [{ path: '' }, { path: 'subpath' }] };
        instance.componentWillReceiveProps(props);
        expect(instance.getClientState).toHaveBeenCalledWith(props);
      });
    });

    describe('when params are the same', () => {
      it('should NOT request the clientState', () => {
        spyOn(instance, 'getClientState');
        instance.componentWillReceiveProps({ params: { ...routeParams }, location });
        expect(instance.getClientState).not.toHaveBeenCalled();
      });
    });
  });

  it('should have a default setReduxState method', () => {
    component = shallow(<RouteHandler/>, { context });
    expect(component.instance().setReduxState).toBeDefined();
  });
});
