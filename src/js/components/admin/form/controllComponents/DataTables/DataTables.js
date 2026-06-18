import React, {} from "react";
import PropTypes from "prop-types";
import {Button, Card} from "react-bootstrap";
import {
  getDistInputColumns
} from "../../../../../utils/profileUtils";

import DataTableCardContent from "./CardContent";
import {useAdminApp} from "../../../AppContext";
import {v4 as uuidv4} from 'uuid';


export default function OutputTables({tableIdx}) {
  const {profile, updateProfile: setProfile, options, inData: {inputTables}} = useAdminApp();



  const {DATA_LOOP_CLASSES} = options;
  const addTable = () => {
    const inputTable = 0
    const header = {}
    if (options) {
      for (let key of ["DATA CLASS", "DATA TYPE", "XUNITS", "YUNITS"]) {
        header[key] = options[key][0];
      }
    }

    let name_t_idx =  profile.tables.length;
    let tableName;
    const loopType = 'none';

    const titles = profile.tables.map((x) => x.title);
    do {
      name_t_idx++;
      tableName = `Table #${name_t_idx}`
    } while (titles.includes(tableName))
    const {options: inputColumns} = getDistInputColumns(inputTables, inputTable)[0];

    const table = {}
    if (inputColumns.length >= 1) {
      table.xColumn = inputColumns[0].value
      if (inputColumns.length >= 2) {
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
      loopOutput: DATA_LOOP_CLASSES[0],
      inputTableIndex: tableIdx,
      tableName,
      loopType,
      uuid: uuidv4()
    });

    setProfile(profile)
  }

  const removeTable = (index) => {
    profile.tables.splice(index, 1)
    setProfile(profile)
  }


  return (<>

    <div className="mt-2">
      <Button
        variant="success"
        size="sm"
        onClick={() => addTable()}
      >
        Add table
      </Button>
    </div>

    {profile.tables.map((table, index) => (
      <Card key={index} className="mt-3">
        <Card.Header className="d-flex align-items-baseline justify-content-between">
          <span>Output table: <b>{table.tableName}</b></span>
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
  </>);
}

OutputTables.propTypes = {
  tableIdx: PropTypes.number.isRequired
};
