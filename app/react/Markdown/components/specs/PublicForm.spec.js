import React from 'react';
import { shallow } from 'enzyme';
import Immutable from 'immutable';
import { LocalForm } from 'react-redux-form';
import PublicForm from '../PublicForm.js';

describe('PublicForm', () => {
  let props;
  let component;
  let instance;
  let submit;
  let request;

  beforeEach(() => {
    request = Promise.resolve('ok');
    submit = jasmine.createSpy('submit').and.returnValue(request);
  });

  const render = (customProps) => {
    props = {
      template: Immutable.fromJS({ _id: '123', properties: [{ type: 'text', name: 'text' }] }),
      thesauris: Immutable.fromJS([]),
      file: false,
      attachments: false,
      submit
    };
    const mappedProps = { ...props, ...customProps };
    component = shallow(<PublicForm.WrappedComponent {...mappedProps}/>);
    instance = component.instance();
    instance.refreshCaptcha = jasmine.createSpy('refreshCaptcha');
    instance.formDispatch = jasmine.createSpy('formDispatch');
  };

  it('should render a form', () => {
    render();
    expect(component).toMatchSnapshot();
  });

  it('should render a form with file and attachments', () => {
    render({ file: true, attachments: true });
    expect(component).toMatchSnapshot();
  });

  it('should submit the values', () => {
    render();
    component.find(LocalForm).simulate('submit', { title: 'test' });
    expect(props.submit).toHaveBeenCalledWith({ file: undefined, title: 'test', template: '123' });
  });

  it('should refresh the captcha and clear the form after submit', (done) => {
    render();
    component.find(LocalForm).simulate('submit', { title: 'test' });
    request.then(() => {
      expect(instance.formDispatch).toHaveBeenCalledWith({ model: 'publicform', type: 'rrf/reset' });
      expect(instance.refreshCaptcha).toHaveBeenCalled();
      done();
    });
  });
});
