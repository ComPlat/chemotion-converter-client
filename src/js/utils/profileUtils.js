function getDataset(profile, datasets) {
  if (datasets && profile?.ols) {
    return datasets.find(o => o?.ols === profile?.ols)
  } else {
    return null
  }
}

function getProfileData(profile, tableIdx = 0) {
  if (!profile?.data) {
    return null;
  }

  return Array.isArray(profile.data) ? profile.data[tableIdx] ?? null : profile.data;
}

function getInputTables(profile, tableIdx = 0) {
  const profileData = getProfileData(profile, tableIdx);
  return profileData ? (profile.matchTables ? [profileData.tables[0]] : profileData.tables) : []
}

function getInputColumns(inputTables) {
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

function getDistInputColumns(profile, tableIdx = 0, tableIndex) {
  const inputTables = getInputTables(profile, tableIdx);
  const table = inputTables[tableIndex];
  const columns = table.columns.map((tableColumn, columnIndex) => {
    return {
        label: tableColumn.name,
        value: {
          tableIndex,
          columnIndex
        }
      };
  });

  return [{
      label: `Table #${tableIndex}`,
      options: columns
    }];
}

function getFileMetadataOptions(profile, tableIdx = 0) {
  const profileData = getProfileData(profile, tableIdx);

  if (profileData) {
    return Object.keys(profileData.metadata).map(key => ({
      key,
      label: key,
      value: profileData.metadata[key]
    }))
  } else {
    return []
  }
}

function getTableMetadataOptions(profile, tableIdx = 0) {
  const inputTables = getInputTables(profile, tableIdx)

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

export { getDataset, getProfileData, getInputTables, getInputColumns, getDistInputColumns, getFileMetadataOptions, getTableMetadataOptions }
