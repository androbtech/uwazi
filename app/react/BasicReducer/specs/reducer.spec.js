import { fromJS as Immutable } from 'immutable';

import createReducer, * as actions from 'app/BasicReducer/reducer';

describe('BasicReducer', () => {
  describe('createReducer', () => {
    it('should return a reducer function with default value passed', () => {
      const reducer = createReducer('namespace', {});
      const newState = reducer();
      expect(newState.toJS()).toEqual({});
    });
  });

  describe('Update', () => {
    it('should set value passed on the same namespace', () => {
      const reducer1 = createReducer('1', []);
      const reducer2 = createReducer('2', []);

      const state1 = reducer1({}, actions.set('1', [{ _id: 1, title: 'test' }, { _id: 2, title: 'test2' }]));
      const state2 = reducer2({}, actions.set('2', [{ _id: 2, title: 'test2' }]));

      const newState1 = reducer1(state1, actions.update('1', { _id: 2, title: 'updated' }));
      const newState2 = reducer1(state2, actions.update('2', { _id: 2, title: 'updated' }));

      expect(newState1.toJS()).toEqual([{ _id: 1, title: 'test' }, { _id: 2, title: 'updated' }]);
      expect(newState2.toJS()).toEqual([{ _id: 2, title: 'test2' }]);
    });

    describe('when value does not exist', () => {
      it('should push it to the collection', () => {
        const reducer1 = createReducer('1', []);
        const reducer2 = createReducer('2', []);

        const state1 = reducer1({}, actions.set('1', [{ _id: 1, title: 'test' }, { _id: 2, title: 'test2' }]));
        const state2 = reducer2({}, actions.set('2', [{ _id: 2, title: 'test2' }]));

        const newState1 = reducer1(state1, actions.update('1', { _id: 3, title: 'created' }));
        const newState2 = reducer1(state2, actions.update('2', { _id: 3, title: 'not created' }));

        expect(newState1.toJS()).toEqual([{ _id: 1, title: 'test' }, { _id: 2, title: 'test2' }, { _id: 3, title: 'created' }]);
        expect(newState2.toJS()).toEqual([{ _id: 2, title: 'test2' }]);
      });
    });
  });

  describe('Update In', () => {
    let reducer;
    let state;
    beforeEach(() => {
      reducer = createReducer('1', { nested: { key: [] } });
      state = Immutable({ nested: { key: [{ _id: 1, title: 'test' }, { _id: 2, title: 'test2' }] } });
    });
    it('should update passed value in a list in a nested key at the namespace', () => {
      const newState = reducer(state, actions.updateIn('1', ['nested', 'key'], { _id: 1, title: 'changed test' }));
      expect(newState.toJS()).toEqual({ nested: { key: [{ _id: 1, title: 'changed test' }, { _id: 2, title: 'test2' }] } });
    });
    describe('when value does not exist', () => {
      it('should push it to the collection at the specified key path', () => {
        const newState = reducer(state, actions.updateIn('1', ['nested', 'key'], { _id: 3, title: 'new' }));
        expect(newState.toJS()).toEqual(
          { nested: { key: [{ _id: 1, title: 'test' }, { _id: 2, title: 'test2' }, { _id: 3, title: 'new' }] } });
      });
    });
  });

  describe('Set', () => {
    it('should set value passed on the same namespace', () => {
      const reducer1 = createReducer('1');
      const reducer2 = createReducer('2');

      const newState1 = reducer1({}, actions.set('1', { newValue: 'value' }));
      const newState2 = reducer2({}, actions.set('1', { newValue: 'value' }));

      expect(newState1.toJS()).toEqual({ newValue: 'value' });
      expect(newState2.toJS()).toEqual({});
    });
  });

  describe('Unset', () => {
    it('should set value passed on the same namespace', () => {
      const reducer1 = createReducer('1', {});
      const reducer2 = createReducer('2', {});

      const newState1 = reducer1({ defaultValue: 'default' }, actions.unset('1'));
      const newState2 = reducer2({ defaultValue: 'default' }, actions.unset('1'));

      expect(newState1.toJS()).toEqual({});
      expect(newState2.toJS()).toEqual({ defaultValue: 'default' });
    });
  });

  describe('Push', () => {
    it('should add an element to an array', () => {
      const reducer1 = createReducer('namespace1', []);
      const reducer2 = createReducer('namespace2', []);

      const newState1 = reducer1(Immutable([{ _id: '1' }]), actions.push('namespace1', { _id: '2' }));
      const newState2 = reducer2(Immutable([{ _id: '1' }]), actions.push('namespace1', { _id: '2' }));

      expect(newState1.toJS()).toEqual([{ _id: '1' }, { _id: '2' }]);
      expect(newState1.get(1).toJS()).toEqual({ _id: '2' });
      expect(newState2.toJS()).toEqual([{ _id: '1' }]);
    });
  });

  describe('Delete', () => {
    it('should delete an element from the array based on the id', () => {
      const reducer1 = createReducer('namespace1', []);
      const reducer2 = createReducer('namespace2', []);

      const newState1 = reducer1([{ _id: '1' }, { _id: '2' }, { _id: '3' }], actions.remove('namespace1', { _id: '2' }));
      const newState2 = reducer2([{ _id: '2' }], actions.remove('namespace1', { _id: '2' }));

      expect(newState1.toJS()).toEqual([{ _id: '1' }, { _id: '3' }]);
      expect(newState2.toJS()).toEqual([{ _id: '2' }]);
    });
  });
});
