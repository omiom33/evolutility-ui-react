// Evolutility-UI-React :: /views/one/Edit.js

// View to add or update one record at a time.

// https://github.com/evoluteur/evolutility-ui-react
// (c) 2022 Olivier Giulieri

import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Icon from "react-crud-icons";

// import moment from 'moment'
// import { withRouter } from 'react-router'
// import {wTimestamp} from "../../../config"
import { i18n_actions, i18n_validation, i18n_errors } from "../../../i18n/i18n";
import { fieldId2Field, fieldTypes as ft } from "../../../utils/dico";
import { dataTitle } from "../../../utils/format";
import validation from "../../../utils/validation";
import OneReadWrite from "./one-readwrite";
import List from "../many/List";
import Alert from "../../widgets/Alert";
import Field from "../../field/Field";
import Panel from "../../widgets/Panel";
import Spinner from "../../shell/Spinner";
import Header from "../../shell/Header";
import { isGraphQL } from "../../../utils/dao";

export default class Edit extends OneReadWrite {
  viewId = "edit";

  _validationOn = false;

  getDataDelta() {
    return this.delta || null;
  }

  clickSave = (evt) => {
    const fields = this.model.fields;
    const v = this.validate(fields, this.state.data);

    if (v.valid) {
      this.upsertOne();
    } else {
      this.setState({
        invalid: !v.valid,
      });
    }
  };

  fieldChange = (evt) => {
    const fid = evt.target.id;
    const newData = JSON.parse(JSON.stringify(this.state.data || {}));
    let v = evt.target.value;

    if (evt.target.type === "checkbox") {
      v = evt.target.checked;
    }
    newData[fid] = v;
    this.setDeltaField(fid, v);
    this.setState({ data: newData });
  };

  isDirty() {
    return this._dirty;
  }

  render() {
    const { id = 0, entity = null, view = "browse" } = this.props.match.params;
    const isNew = id === 0 || id === "0";
    const ep = "/" + entity + "/";
    const m = this.model;
    const data = this.state.data || {};
    const cbs = {
      // click: this.fieldClick,
      // leave: this.fieldLeave,
      change: this.fieldChange,
      dropFile: this.uploadFileOne,
    };
    const title = this.state.error ? "No data" : dataTitle(m, data, isNew);
    const linkBrowse = isNew ? ep + "list" : ep + view + (id ? "/" + id : "");
    const listData = (cid) => (data.collections ? data.collections[cid] : null);
    const fnField = (f) => {
      if (f) {
        if (f.type === ft.lov && !f.list) {
          // - fetch list values
          if (isGraphQL) {
            // TODO: dynamically get the LOV
            const dId = data[f.id];
            const dLabel = data[f.id + "_txt"];
            // TODO: too hacky, really modify model?
            f.list = [
              { id: dId, text: dLabel },
              { id: 0, text: " - Dynamic LOVs is no implemented yet -" },
            ];
          } else {
            this.getLOV(f.id);
          }
        }
        return (
          <Field
            key={f.id}
            ref={f.id}
            model={f}
            value={data[f.id]}
            data={data}
            callbacks={cbs}
            entity={entity}
          />
        );
      }
      return null;
    };

    if (this.state.loading && !isNew) {
      return <Spinner />;
    }

    document.title = title;
    this.isNew = isNew;
    // const date = wTimestamp ? moment(data['u_date']) : null
    if (!m) {
      return (
        <Alert
          title="Error"
          message={i18n_errors.badEntity.replace("{0}", entity)}
        />
      );
    }
    return (
      <div className="evolutility" role="form">
        <Header
          {...this.props.match.params}
          title={title}
          model={m}
          comments={data.nb_comments}
          count={null}
          cardinality="1"
          view={this.viewId}
        />

        <div className="evo-one-edit">
          {this.state.error ? (
            <Alert title="Error" message={this.state.error.message} />
          ) : (
            <div className="evol-pnls">
              {m && m.groups ? (
                m.groups.map(function (g, idx) {
                  const groupFields = fieldId2Field(g.fields, m.fieldsH);
                  return (
                    <Panel
                      key={g.id || "g" + idx}
                      title={g.label || g.title || ""}
                      header={g.header}
                      footer={g.footer}
                      width={g.width}
                    >
                      <div className="evol-fset">
                        {groupFields.map(fnField)}
                      </div>
                    </Panel>
                  );
                })
              ) : (
                <Panel title={title} key="pAllFields">
                  <div className="evol-fset">{m.fields.map(fnField)}</div>
                </Panel>
              )}

              {m.collections && !isNew
                ? m.collections.map((c) => (
                    <Panel
                      key={"collec_" + c.id}
                      title={c.title}
                      collapsible
                      header={c.header}
                      footer={c.footer}
                    >
                      <List
                        isNested
                        match={this.props.match}
                        paramsCollec={c}
                        style={{ width: "100%" }}
                        data={listData(c.id)}
                        location={this.props.location}
                      />
                    </Panel>
                  ))
                : null}

              <Panel key="formButtons">
                <div className="evol-buttons">
                  <Link className="btn btn-default" to={linkBrowse}>
                    <Icon
                      className="ico-cancel"
                      name="close"
                      size="medium"
                      theme="none"
                    />{" "}
                    {i18n_actions.cancel}
                  </Link>
                  <button className="btn btn-primary" onClick={this.clickSave}>
                    <Icon name="save" size="medium" theme="none" />{" "}
                    {i18n_actions.save}
                  </button>
                  {this.state.error ? i18n_validation.incomplete : null}
                </div>
              </Panel>
            </div>
          )}
        </div>
      </div>
    );
  }

  validate = (fields, data) => {
    const messages = [];
    const invalids = {};
    let cMsg;

    this.clearValidation();
    fields.forEach((f) => {
      cMsg = validation.validateField(f, data[f.id]);
      if (cMsg) {
        messages.push(cMsg);
        invalids[f.id] = true;
        if (this.refs[f.id]) {
          this.refs[f.id].setState({
            invalid: true,
            message: cMsg,
          });
          this._validationOn = true;
        } else {
          console.error(
            'Field ref for "' +
              f.id +
              "\" not found. The field doesn't not belong to any group in the model."
          );
        }
      } else if (this.refs[f.id] && this.refs[f.id].invalid) {
        this.refs[f.id].setState({
          invalid: false,
          message: null,
        });
      }
    });
    if (messages.length) {
      toast.error(i18n_validation.incomplete + " " + messages.join(" "));
    }
    return {
      valid: messages.length < 1,
      messages,
      invalids,
    };
  };

  clearValidation() {
    if (this.model) {
      this.model.fields.forEach((f) => {
        if (this.refs[f.id]) {
          this.refs[f.id].setState({
            invalid: false,
            message: null,
          });
        } else {
          console.log('Missing field "' + f.id + '" in clearValidation.');
        }
      });
    }
    this._validationOn = false;
  }

  setDeltaField(fid, value) {
    if (!this.delta) {
      this.delta = {};
    }
    this.delta[fid] = value;
    this._dirty = true;
  }
}

Edit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      entity: PropTypes.string.isRequired,
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
};
