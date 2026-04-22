import React, {createContext, useContext, useEffect, useState} from "react";

import ConverterApi from '../../api/ConverterApi';

const AppContext = createContext();

export function AdminProvider({children}) {
  const [activeTabKey, setActiveTabKey] = useState('basics');
  const [profiles, setProfiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [options, setOptions] = useState([]);
  const [profile, setProfile] = useState(null);

  const updateProfile = (nextProfile) => {
    setProfile({...nextProfile});
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

  return (
    <AppContext.Provider value={{
      activeTabKey, setActiveTabKey,
      profiles, setProfiles,
      datasets, setDatasets,
      options, setOptions,
      profile, setProfile, updateProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAdminApp() {
  return useContext(AppContext);
}