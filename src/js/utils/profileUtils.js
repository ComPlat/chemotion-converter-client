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


function getInputColumns(inputTables, inputTableIdx) {
  if (inputTables.length > 0) {
    return [
      {
        label: `Input table #${inputTableIdx}`,
        options: inputTables[inputTableIdx]?.columns.map((tableColumn, columnIndex) => {
          return Object.assign({}, tableColumn, {
            label: `${tableColumn.name}`,
            value: {
              columnIndex: columnIndex
            }
          });
        }) ?? []
      }

    ]
  }
  return [];
}

function getDistInputColumns(inputTables, tableIndex) {
  const table = inputTables[tableIndex];
  const columns = table?.columns.map((tableColumn, columnIndex) => {
    return {
        label: tableColumn.name,
        value: {
          columnIndex
        }
      };
  });

  return [{
      label: `Table #${tableIndex}`,
      options: columns || []
    }];
}

function getFileMetadataOptions(activeData) {
  if (activeData) {
    return Object.keys(activeData.metadata).map(key => ({
      key,
      label: key,
      value: activeData.metadata[key]
    }))
  } else {
    return []
  }
}

function getTableMetadataOptions(inputTables, inputTableIndex = -1) {

  if (!inputTables?.length) return [];

  const tables =
    inputTableIndex >= 0
      ? [inputTables[inputTableIndex]]
      : inputTables;

  const startOffset = inputTableIndex >= 0 ? inputTableIndex : 0;

  return tables.flatMap((table, index) => {
    if (!table?.metadata) return [];

    const tableIndex = index + startOffset;

    return Object.entries(table.metadata).map(([key, value]) => ({
      key,
      tableIndex,
      value,
      label: `(#${tableIndex+1}) ${key}`,
    }));
  });
}

export { getDataset, getProfileData, getInputColumns, getDistInputColumns, getFileMetadataOptions, getTableMetadataOptions }
