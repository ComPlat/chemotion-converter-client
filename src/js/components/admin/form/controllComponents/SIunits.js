import React, {useState} from "react";
import PropTypes from "prop-types";
import {Button, Card, Form, Table} from "react-bootstrap";
import {getInputColumns} from "../../../../utils/profileUtils";

const profileShape = PropTypes.shape({
  data: PropTypes.shape({
    units: PropTypes.arrayOf(PropTypes.shape({
      base_unit: PropTypes.string,
      conversion_factor: PropTypes.string,
      found: PropTypes.string
    }))
  })
});

function UnitAssignmentToggle({isOpen, onToggle}) {
  return (
    <Button
      variant={isOpen ? "outline-danger" : "outline-success"}
      size="sm"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
  <b>{isOpen ? "-" : "+"}</b>
    </Button>
  );
}

UnitAssignmentToggle.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default function SIunits({profile}) {
  const units = profile?.data?.units ?? [];
  const inputColumns = getInputColumns(profile);
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (rowId) => {
    setOpenRows((current) => ({
      ...current,
      [rowId]: current[rowId] ? false : true
    }));
  };

  return (
    <Card className="mt-3">
      <Card.Header>SI Units</Card.Header>
      <Card.Body>
        {units.length === 0 ? (
          <small className="text-muted">
            No SI unit mappings found in <code>profile.data.units</code>.
          </small>
        ) : (
          <Table striped bordered hover size="sm" responsive>
            <thead>
              <tr>
                <th>Found</th>
                <th>Conversion</th>
                <th>Base</th>
                <th className="text-center" style={{width: "1%"}}></th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => {
                const rowId = (unit.found || "unit") + "-" + index;
                const isOpen = Boolean(openRows[rowId]);

                return (
                  <React.Fragment key={rowId}>
                    <tr>
                      <td>{unit.found}</td>
                      <td>{unit.conversion_factor}</td>
                      <td>{unit.base_unit}</td>
                      <td className="text-center align-middle">
                        <UnitAssignmentToggle
                          isOpen={isOpen}
                          onToggle={() => toggleRow(rowId)}
                        />
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td className="align-top bg-light">
                          <Form.Group className="mb-0">
                            <Form.Label className="small text-muted mb-1">
                              Assign to Output Table # using Input Column
                            </Form.Label>
                            <div className="d-flex gap-2 align-items-start">
                              <Form.Control type="number" min="0" size="sm" placeholder="0" />
                              <Form.Select size="sm" defaultValue="">
                                <option value="">Select input column</option>
                                {inputColumns.map((column) => (
                                  <option key={String(column.value)} value={column.value}>
                                    {column.label}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </Form.Group>
                        </td>
                        <td className="align-top bg-light">
                          <Form.Group className="mb-0">
                            <Form.Label className="small text-muted mb-1">For</Form.Label>
                            <Form.Select size="sm" defaultValue="X">
                              <option value="X">X</option>
                              <option value="Y">Y</option>
                            </Form.Select>
                          </Form.Group>
                        </td>
                        <td className="align-top bg-light">
                          <Form.Group className="mb-0">
                            <Form.Label className="small text-muted mb-1">As</Form.Label>
                            <Form.Select size="sm" defaultValue="Found">
                              <option value="Found">Found</option>
                              <option value="Base">Base</option>
                            </Form.Select>
                          </Form.Group>
                        </td>
                        <td className="align-bottom bg-light text-center">
                          <Button variant="secondary" size="sm" type="button">
                            Do
                          </Button>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

SIunits.propTypes = {
  profile: profileShape.isRequired
};
