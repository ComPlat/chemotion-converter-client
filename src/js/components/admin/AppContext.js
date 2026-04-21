import React, {createContext, useContext, useEffect, useState} from "react";

import ConverterApi from '../../api/ConverterApi';

const AppContext = createContext();

export function AdminProvider({children}) {
  const [activeTabKey, setActiveTabKey] = useState('basics');
  const [profiles, setProfiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [options, setOptions] = useState([]);

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

  return (
    <AppContext.Provider value={{
      activeTabKey, setActiveTabKey,
      profiles, setProfiles,
      datasets, setDatasets,
      options, setOptions
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAdminApp() {
  return useContext(AppContext);
}