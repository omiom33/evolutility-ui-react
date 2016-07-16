import React from 'react'

import models from '../../models/all_models'
import one from './one'
import Field from '../../widgets/Field'
import Panel from '../../widgets/Panel'
import NavLink from '../../widgets/NavLink'

export default React.createClass({

  propTypes: {
    params: React.PropTypes.object
  },

  mixins: [one()],

  clickCancel(evt){

  },

  render() {
    var id=this.props.params.id || 0
    var e=this.props.params.entity || null
    var ep='/'+e+'/'
    var m=models[e]
    var data = this.state.data || {}
    var title = m.label || m.title || ''

    return (
      <div data-entity={e} className="evo-one-browse">
        <div className="evol-pnls">
          <Panel title={title}>
            <div className="evol-fset">
              {m.fields.map(function(f, idx){
                var attr = (f.type==='lov' && f.lovtable) ? f.id+'_txt' : f.id
                return (
                    <Field 
                      key={idx} 
                      meta={f} 
                      data={data[attr]} 
                      readOnly={true}
                      entity={e}
                    />
                )
              })}
            </div>
            <div className="formButtons"> 
                <NavLink to={ep+"edit/"+id} className="btn btn-primary">
                  <i className="glyphicon glyphicon-edit"></i> edit
                </NavLink>
                <button className="btn btn-secondary">Cancel</button>
            </div>
          </Panel>
        </div>
      </div>
    )
  }
})
