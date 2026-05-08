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

function getInputColumns(inputTables, inputTableIdx) {
  if (inputTables.length > 0) {
    return [
      {
        label: `Input table #${inputTableIdx}`,
        options: inputTables[inputTableIdx].columns.map((tableColumn, columnIndex) => {
          return Object.assign({}, tableColumn, {
            label: `${tableColumn.name}`,
            value: {
              columnIndex: columnIndex
            }
          });
        })
      }

    ]
  }
  return [];
}

function getDistInputColumns(profile, tableIdx = 0, tableIndex) {
  const inputTables = getInputTables(profile, tableIdx);
  const table = inputTables[tableIndex];
  const columns = table.columns.map((tableColumn, columnIndex) => {
    return {
        label: tableColumn.name,
        value: {
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

function getTableMetadataOptions(profile, tableIdx = 0, inputTableIndex = -1) {
  const inputTables = getInputTables(profile, tableIdx);

  if (!inputTables.length) return [];

  const tables =
    inputTableIndex >= 0
      ? [inputTables[inputTableIndex]]
      : inputTables;

  const startOffset = inputTableIndex >= 0 ? inputTableIndex : 0;

  return tables.flatMap((table, index) => {
    if (!table.metadata) return [];

    const tableIndex = index + startOffset;

    return Object.entries(table.metadata).map(([key, value]) => ({
      key,
      tableIndex,
      value,
      label: `Input table #${tableIndex} ${key}`,
    }));
  });
}

export { getDataset, getProfileData, getInputTables, getInputColumns, getDistInputColumns, getFileMetadataOptions, getTableMetadataOptions }
