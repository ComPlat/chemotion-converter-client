import React from "react";
import PropTypes from "prop-types";
import {Card, Table} from "react-bootstrap";

const profileShape = PropTypes.shape({
  data: PropTypes.shape({
    units: PropTypes.arrayOf(PropTypes.shape({
      base_unit: PropTypes.string,
      conversion_factor: PropTypes.string,
      found: PropTypes.string
    }))
  })
});

export default function SIunits({profile}) {
  const units = profile?.data?.units ?? [];

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
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => (
                <tr key={`${unit.found ?? "unit"}-${index}`}>
                  <td>{unit.found}</td>
                  <td>{unit.conversion_factor}</td>
                  <td>{unit.base_unit}</td>
                </tr>
              ))}
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
