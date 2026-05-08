import React, {useMemo} from "react";
import PropTypes from "prop-types";
import {Button, Card} from "react-bootstrap";
import {
  getDistInputColumns,
  getInputTables,
  getInputColumns
} from "../../../../../utils/profileUtils";

import DataTableCardContent from "./CardContent";

const profileShape = PropTypes.shape({
  data: PropTypes.object,
  tables: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.object,
    table: PropTypes.object,
    loopType: PropTypes.string,
    matchTables: PropTypes.bool
  })),
  matchTables: PropTypes.bool
});

export default function OutputTables({profile, setProfile, options, tableIdx}) {


  const inputTables = useMemo(() => getInputTables(profile, tableIdx), [tableIdx]);
  const inputColumns = getInputColumns(inputTables);
  const addTable = () => {
    const inputTable = 0
    const header = {}
    if (options) {
      for (let key of ["DATA CLASS", "DATA TYPE", "XUNITS", "YUNITS"]) {
        header[key] = options[key][0];
      }
    };

    const inputColumns = getDistInputColumns(profile, tableIdx, inputTable);
    const table = {}
    if (inputColumns.length > 2) {
      table.xColumn = inputColumns[0].value
      table.yColumn = inputColumns[1].value
    }

    profile.tables.push({
      header,
      table,
      inputTable
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
          profile={profile}
          table={table}
          index={index}
          inputTables={inputTables}
          inputColumns={inputColumns}
          setProfile={setProfile} options={options} tableIdx={tableIdx}/>
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
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
  tableIdx: PropTypes.number.isRequired
};
