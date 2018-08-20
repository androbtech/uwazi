import { Helmet } from 'react-helmet';
import { browserHistory } from 'react-router';
import { actions as formActions } from 'react-redux-form';
import React from 'react';

import { actions } from 'app/BasicReducer';
import { isClient } from 'app/utils';
import { setReferences } from 'app/Viewer/actions/referencesActions';
import { toUrlParams } from 'shared/JSONRequest';
import RouteHandler from 'app/App/RouteHandler';
import Viewer from 'app/Viewer/components/Viewer';
import entitiesAPI from 'app/Entities/EntitiesAPI';
import * as relationships from 'app/Relationships/utils/routeUtils';
import { scrollToPage } from './actions/uiActions';

import { requestViewerState, setViewerState } from './actions/routeActions';

class ViewDocument extends RouteHandler {
  constructor(props, context) {
    //Force client state even if is rendered from server to force the pdf character count process
    RouteHandler.renderedFromServer = props.renderedFromServer || false;
    //
    super(props, context);
    this.onPageChange = this.onPageChange.bind(this);
    this.onDocumentReady = this.onDocumentReady.bind(this);
  }

  static requestState(routeParams, query = {}, globalResources) {
    return requestViewerState({ ...routeParams, raw: query.raw || !isClient, page: query.page }, globalResources);
  }

  componentWillUnmount() {
    this.emptyState();
  }

  componentWillMount() {
    if (this.props.location.query.searchTerm) {
      this.context.store.dispatch(actions.set('viewer.sidepanel.tab', 'text-search'));
    }
  }

  componentWillReceiveProps(props) {
    super.componentWillReceiveProps(props);
    const { query = {} } = props.location;
    if (query.page !== this.props.location.query.page && query.raw) {
      entitiesAPI.getRawPage(props.params.documentId, query.page)
      .then((pageText) => {
        this.context.store.dispatch(actions.set('viewer/rawText', pageText));
      });
    }
  }

  emptyState() {
    this.context.store.dispatch(actions.unset('viewer/doc'));
    this.context.store.dispatch(actions.unset('viewer/templates'));
    this.context.store.dispatch(actions.unset('viewer/thesauris'));
    this.context.store.dispatch(actions.unset('viewer/relationTypes'));
    this.context.store.dispatch(actions.unset('viewer/rawText'));
    this.context.store.dispatch(formActions.reset('documentViewer.tocForm'));
    this.context.store.dispatch(actions.unset('viewer/targetDoc'));
    this.context.store.dispatch(setReferences([]));
    this.context.store.dispatch(relationships.emptyState());
  }

  setReduxState(state) {
    this.context.store.dispatch(setViewerState(state));
  }

  onPageChange(newPage) {
    const { query: { page, ...queryWithoutPage } } = this.props.location;
    queryWithoutPage.raw = queryWithoutPage.raw || undefined;
    browserHistory.push(`${this.props.location.pathname}${toUrlParams({ ...queryWithoutPage, page: newPage })}`);
  }

  onDocumentReady() {
    if (!this.props.location.query.raw && this.props.location.query.page) {
      scrollToPage(this.props.location.query.page);
    }
  }

  render() {
    const { query = {}, pathname } = this.props.location;
    const raw = query.raw || !isClient;
    const page = Number(query.page || 1);
    return (
      <React.Fragment>
        <Helmet>
          {raw && <link rel="canonical" href={`${pathname}?page=${page}`} />}
        </Helmet>
        <Viewer
          raw={raw}
          searchTerm={query.searchTerm}
          onPageChange={this.onPageChange}
          onDocumentReady={this.onDocumentReady}
        />
      </React.Fragment>
    );
  }
}

ViewDocument.defaultProps = {
  params: {}
};

export default ViewDocument;
