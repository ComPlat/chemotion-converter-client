import React, {useMemo} from "react";
import PropTypes from "prop-types";
import {Button, Card} from "react-bootstrap";
import {
  getDistInputColumns
} from "../../../../../utils/profileUtils";

import DataTableCardContent from "./CardContent";
import {useAdminApp} from "../../../AppContext";


export default function OutputTables({tableIdx}) {
  const {profile, updateProfile: setProfile, options, inData: {inputTables}} = useAdminApp();



  const addTable = () => {
    const inputTable = 0
    const header = {}
    if (options) {
      for (let key of ["DATA CLASS", "DATA TYPE", "XUNITS", "YUNITS"]) {
        header[key] = options[key][0];
      }
    };

    const inputColumns = getDistInputColumns(inputTables, inputTable);
    const table = {}
    if (inputColumns.length > 1) {
      table.xColumn = inputColumns[0].value
      if (inputColumns.length > 2) {
        table.yColumn = inputColumns[1].value
      } else {
        table.yColumn = inputColumns[0].value
      }
    } else {
      table.xColumn = {columnIndex: 0}
      table.xColumn = {columnIndex: 1}
    }

    profile.tables.push({
      header,
      table,
      inputTableIndex: tableIdx
    });

    setProfile(profile)
  }

  const removeTable = (index) => {
    profile.tables.splice(index, 1)
    setProfile(profile)
  }


  return (<>
    {profile.tables.map((table, index) => (
      <Card key={index} className="mt-3">
        <Card.Header className="d-flex align-items-baseline justify-content-between">
          Output table #{index}
          <Button
            variant="danger"
            size="sm"
            onClick={() => removeTable(index)}
          >
            Remove
          </Button>
        </Card.Header>
        <Card.Body>
          <DataTableCardContent
          table={table}
          index={index}
          inputTables={inputTables}
          tableIdx={tableIdx}/>
        </Card.Body>
      </Card>
    ))}

    <div className="mt-2">
      <Button
        variant="success"
        size="sm"
        onClick={() => addTable()}
      >
        Add table
      </Button>
    </div>
  </>);
}

OutputTables.propTypes = {
  tableIdx: PropTypes.number.isRequired
};
