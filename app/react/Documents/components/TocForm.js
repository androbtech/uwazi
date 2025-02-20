import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Form, Field } from 'react-redux-form';
import { Icon } from 'UI';

export class TocForm extends Component {
  indentButton(direction, tocElement) {
    const { indent } = this.props;
    const onClick = indent.bind(null, tocElement, tocElement.indentation + (direction === 'more' ? 1 : -1));
    return (
      <button type="button" onClick={onClick} className={`toc-indent-${direction} btn btn-default`}>
        <Icon icon={direction === 'more' ? 'arrow-right' : 'arrow-left'} directionAware />
      </button>
    );
  }

  render() {
    const { toc, model, removeEntry, onSubmit } = this.props;
    return (
      <Form className="toc" id="tocForm" model={model} onSubmit={onSubmit} >
        {toc.map((tocElement, index) => (
          <div className={`toc-indent-${tocElement.indentation}`} key={index}>
            <div className="toc-edit">
              {this.indentButton('less', tocElement)}
              {this.indentButton('more', tocElement)}
              <Field model={`${model}[${index}].label`} >
                <input className="form-control"/>
              </Field>
              <button type="button" onClick={removeEntry.bind(this, tocElement)} className="btn btn-danger">
                <Icon icon="trash-alt" />
              </button>
            </div>
          </div>
            ))}
      </Form>
    );
  }
}

TocForm.defaultProps = {
  toc: [],
  removeEntry: () => {},
  indent: () => {},
  onSubmit: () => {},
};

TocForm.propTypes = {
  toc: PropTypes.array,
  model: PropTypes.string.isRequired,
  removeEntry: PropTypes.func,
  indent: PropTypes.func,
  onSubmit: PropTypes.func
};

export default TocForm;
