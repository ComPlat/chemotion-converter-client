import React, {createContext, useContext, useEffect, useState} from "react";

import ConverterApi from '../../api/ConverterApi';

const AppContext = createContext();

export function AdminProvider({children}) {
  const [activeTabKey, setActiveTabKey] = useState('basics');
  const [profiles, setProfiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [options, setOptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [inData, setInData] = useState(null);



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

  useEffect(() => {
    if (profile) {
      setInData(profile.data);
    }
  }, [profile?.data.length]);

  return (
    <AppContext.Provider value={{
      activeTabKey, setActiveTabKey,
      profiles, setProfiles,
      datasets, setDatasets,
      options, setOptions,
      profile, setProfile,
      updateProfile, updateProfileList
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAdminApp() {
  return useContext(AppContext);
}