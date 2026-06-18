import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

import ConverterApi from '../../api/ConverterApi';
import {
  getFileMetadataOptions,
  getProfileData,
  getTableMetadataOptions
} from "../../utils/profileUtils";

const AppContext = createContext();

export function AdminProvider({children}) {
  const [activeTabKey, setActiveTabKey] = useState('basics');
  const [activeInputTable, setActiveInputTable] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [options, setOptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [tableIdx, setTableIdx] = useState(0);


  const updateProfileList = (profile) => {
    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const index = updatedProfiles.findIndex(p => (p.id === profile.id))
      updatedProfiles[index] = profile
      return updatedProfiles;
    });
  }

  const updateProfile = (nextProfile, {updateList = false} = {}) => {
    setProfile({...nextProfile});
    if (updateList) {
      updateProfileList(nextProfile);
    }
  };

  useEffect(() => {
    Promise.all([
      ConverterApi.fetchProfiles(),
      ConverterApi.fetchDatasets(),
      ConverterApi.fetchOptions()
    ]).then(responses => {
      const [profilesResponse, datasetsResponse, optionsResponse] = responses
      setProfiles(profilesResponse);
      setDatasets(datasetsResponse);
      setOptions(optionsResponse);
    })
  }, []);

  const inData = useMemo(() => {
    if (profile) {
      const activeData = getProfileData(profile, tableIdx);
      const tableMetadataArchive = {}
      return {
        activeData,
        fileMetadataOptions: getFileMetadataOptions(activeData),
        inputTables: activeData.tables,
        getTableMetadataOptions: (inputTable) => {
          if(!tableMetadataArchive[inputTable]) {
            tableMetadataArchive[inputTable] = getTableMetadataOptions(activeData?.tables, inputTable);
          }
          return tableMetadataArchive[inputTable];
        }
      };

    }
    return {};
  }, [profile?.data.length, tableIdx]);

  return (
    <AppContext.Provider value={{
      activeTabKey, setActiveTabKey,
      profiles, setProfiles,
      datasets, setDatasets,
      options, setOptions,
      profile, setProfile,
      updateProfile, updateProfileList,
      tableIdx, setTableIdx,
      activeInputTable, setActiveInputTable,
      inData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAdminApp() {
  return useContext(AppContext);
}