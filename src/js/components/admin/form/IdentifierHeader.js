import React, { Component } from "react"
import PropTypes from 'prop-types';

class IdentifierHeader extends Component {

    render() {
        const { identifier, show, onToggle, onRemove } = this.props

        return (
            <p>
                <span className="pull-right">
                    <button type="button" className="button-right btn btn-xs btn-info ml-5"
                        onClick={() => onToggle()}>
                        { show ? 'Hide' : 'Show' }
                    </button>
                    <button type="button" className="button-right btn btn-xs btn-danger ml-5"
                        onClick={() => onRemove()}>
                        Remove
                    </button>
                </span>
                <code>
                    { identifier.tableIndex !== undefined && `Input table #${identifier.tableIndex} ` }
                    { identifier.key }
                    { identifier.lineNumber !== undefined && `Line ${identifier.lineNumber}`}
                </code>
                {
                    identifier.outputKey && <React.Fragment>
                        <span className="mr-5 ml-5">&#8594;</span>
                        <code>
                            { identifier.outputLayer && `${identifier.outputLayer}/`}
                            { identifier.outputKey }
                        </code>
                    </React.Fragment>
                }
            </p>
        )
    }
}

IdentifierHeader.propTypes = {
  identifier: PropTypes.object,
  show: PropTypes.bool
}

export default IdentifierHeader
