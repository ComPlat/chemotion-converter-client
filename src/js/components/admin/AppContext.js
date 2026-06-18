import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import ConverterApi from '../../api/ConverterApi';
import {
  getFileMetadataOptions,
  getProfileData,
  getTableMetadataOptions
} from "../../utils/profileUtils";
import PropTypes from "prop-types";

let AppContext = null;

function getAppContext() {
  if (!AppContext) {
    AppContext = createContext();
  }

  return AppContext;
}

export function AdminProvider({ children, isAdmin}) {
  const [activeTabKey, setActiveTabKey] = useState('basics');
  const [activeInputTable, setActiveInputTable] = useState(0);
  const [profiles, _setProfiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [options, _setOptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [tableIdx, setTableIdx] = useState(0);


  const setProfiles = (obj) => {
    if (typeof obj === "object" && !Array.isArray(obj) &&  Object.hasOwn(obj, "profiles")) {
      _setProfiles(obj.profiles);
    } else {
      _setProfiles(obj);
    }
  }


  const setOptions = (obj) => {
    if (typeof obj === "object" && !Array.isArray(obj) &&  Object.hasOwn(obj, "options")) {
      _setOptions(obj.options);
    } else {
      _setOptions(obj);
    }
  }

  const updateProfileList = (profile) => {
    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const index = updatedProfiles.findIndex(p => (p.id === profile.id))
      updatedProfiles[index] = profile
      return updatedProfiles;
    });
  }

  const updateProfile = (nextProfile, { updateList = false } = {}) => {
    setProfile({ ...nextProfile });
    if (updateList) {
      updateProfileList(nextProfile);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      ConverterApi.fetchProfiles(isAdmin).then((profilesResponse)=>{
        setProfiles(profilesResponse);
        setDatasets([]);
        setOptions([]);
      });
      return;
    }

    Promise.all([
      ConverterApi.fetchProfiles(isAdmin),
      ConverterApi.fetchDatasets(),
      ConverterApi.fetchOptions(),
      ConverterApi.fetchDatasetsUnits()
    ]).then(responses => {
      const [profilesResponse,
        datasetsResponse,
        optionsResponse, datasetUnitsResponse] = responses
      setProfiles(profilesResponse);
      setDatasets(datasetsResponse);
      setOptions(optionsResponse);
      setOptions(datasetUnitsResponse);
    })
  }, [isAdmin]);

  const inData = useMemo(() => {
    if (profile) {
      const activeData = getProfileData(profile, tableIdx);
      const tableMetadataArchive = {}
      return {
        activeData,
        fileMetadataOptions: getFileMetadataOptions(activeData),
        inputTables: activeData.tables,
        getTableMetadataOptions: (inputTable) => {
          if (!tableMetadataArchive[inputTable]) {
            tableMetadataArchive[inputTable] = getTableMetadataOptions(activeData?.tables, inputTable);
          }
          return tableMetadataArchive[inputTable];
        }
      };

    }
    return {};
  }, [profile?.data.length, tableIdx]);
  getAppContext();
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

AdminProvider.propTypes = {
  isAdmin: PropTypes.bool.isRequired
}

export function useAdminApp() {
  return useContext(getAppContext());
}