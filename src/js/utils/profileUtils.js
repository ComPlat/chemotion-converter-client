function getDataset(profile, datasets) {
  if (datasets && profile?.ols) {
    return datasets.find(o => o?.ols === profile?.ols)
  } else {
    return null
  }
}

function getInputTables(profile) {
  return profile.data ? (profile.matchTables ? [profile.data.tables[0]] : profile.data.tables) : []
}

function getInputColumns(profile) {
  const inputTables = getInputTables(profile)

  if (inputTables.length > 0) {
    return inputTables.reduce((accumulator, table, tableIndex) => {
      const tableColumns = table.columns.map((tableColumn, columnIndex) => {
        return Object.assign({}, tableColumn, {
          label: `Input table #${tableIndex} ${tableColumn.name}`,
          value: {
            tableIndex: tableIndex,
            columnIndex: columnIndex
          }
        })
      })
      return accumulator.concat(tableColumns)
    }, [])
  } else {
    return []
  }
}

function getDistInputColumns(profile) {
  const inputTables = getInputTables(profile);
  const seenNames = new Set();

  return inputTables.map((table, tableIndex) => {
    const columns = table.columns.map((tableColumn, columnIndex) => {
      if (seenNames.has(tableColumn.name)) return null;
      seenNames.add(tableColumn.name);

      return {
        label: tableColumn.name,
        value: {
          tableIndex,
          columnIndex
        }
      };
    }).filter(Boolean); // remove nulls

    return {
      label: `Table #${tableIndex}`,
      options: columns
    };
  }).filter(group => group.options.length > 0); // remove empty groups
}

function getFileMetadataOptions(profile) {
  if (profile.data) {
    return Object.keys(profile.data.metadata).map(key => ({
      key,
      label: key,
      value: profile.data.metadata[key]
    }))
  } else {
    return []
  }
}

function getTableMetadataOptions(profile) {
  const inputTables = getInputTables(profile)

  if (inputTables.length > 0) {
    return inputTables.reduce((acc, table, tableIndex) => {
      if (table.metadata !== undefined) {
        return acc.concat(Object.keys(table.metadata).map(key => ({
          key,
          tableIndex,
          value: table.metadata[key],
          label: `Input table #${tableIndex} ${key}` })))
      } else {
        return acc
      }
    }, [])
  } else {
    return []
  }
}

export { getDataset, getInputTables, getInputColumns, getDistInputColumns, getFileMetadataOptions, getTableMetadataOptions }
