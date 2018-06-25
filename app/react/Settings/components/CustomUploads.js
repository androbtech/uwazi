import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Thumbnail } from 'app/Layout';

import { t } from 'app/I18N';

import { uploadCustom } from '../../Uploads/actions/uploadsActions';

export class CustomUploads extends Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(files) {
    files.forEach((file) => {
      this.props.upload(file);
    });
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">{t('System', 'Custom Uploads')}</div>
        <div className="panel-body">
          <Dropzone
            className="upload-box"
            onDrop={this.onDrop}
          >
            <div className="upload-box_wrapper">
              <i className="fa fa-upload" />
              <button className="upload-box_link">Browse files to upload</button>
              <span> or drop your files here.</span>
            </div>
            <div className="protip">
              <i className="fa fa-lightbulb-o" />
            </div>
          </Dropzone>
        </div>
        {this.props.progress && <p>Uploading ...</p>}
        <ul>
          {this.props.customUploads.map(upload => (
            <li key={upload.get('filename')}>
              <Thumbnail file={`/uploaded_documents/${upload.get('filename')}`} />{`/uploaded_documents/${upload.get('filename')}`}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

CustomUploads.defaultProps = {
  progress: false
};

CustomUploads.propTypes = {
  progress: PropTypes.bool,
  customUploads: PropTypes.instanceOf(Immutable.List).isRequired,
  upload: PropTypes.func.isRequired
};

export const mapStateToProps = ({ customUploads, progress }) => ({
  customUploads,
  progress: !!progress.filter((v, key) => key.match(/customUpload/)).size
});

const mapDispatchToProps = dispatch => bindActionCreators({ upload: uploadCustom }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CustomUploads);
