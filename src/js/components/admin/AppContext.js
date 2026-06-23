import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import PropTypes from "prop-types";

import ConverterApi from '../../api/ConverterApi';
import {
  getFileMetadataOptions,
  getProfileData,
  getTableMetadataOptions
} from "../../utils/profileUtils";

// Key that changes only when inData needs to be recomputed. Mirrors the
// original useMemo dependency list of [profile?.data.length, tableIdx].
const inDataKey = (profile, tableIdx) =>
  `${profile ? profile.data.length : "none"}:${tableIdx}`;

const computeInData = (profile, tableIdx) => {
  if (!profile) {
    return {};
  }

  const activeData = getProfileData(profile, tableIdx);
  const tableMetadataArchive = {};
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
};

export const useAdminStore = create((set, get) => {
  // Recompute inData lazily, only when its dependencies actually change, so the
  // (stable) inData reference doesn't force re-renders of components reading it.
  const withInData = (partial) => {
    const profile = "profile" in partial ? partial.profile : get().profile;
    const tableIdx = "tableIdx" in partial ? partial.tableIdx : get().tableIdx;
    const nextKey = inDataKey(profile, tableIdx);
    if (nextKey === get()._inDataKey) {
      return partial;
    }
    return { ...partial, inData: computeInData(profile, tableIdx), _inDataKey: nextKey };
  };

  return {
    activeTabKey: 'basics',
    activeInputTable: 0,
    profiles: [],
    datasets: [],
    options: [],
    profile: null,
    tableIdx: 0,
    inData: {},
    _inDataKey: inDataKey(null, 0),

    setActiveTabKey: (activeTabKey) => set({ activeTabKey }),
    setActiveInputTable: (activeInputTable) => set({ activeInputTable }),
    setDatasets: (datasets) => set({ datasets }),

    setProfiles: (obj) => {
      if (typeof obj === "function") {
        set((state) => ({ profiles: obj(state.profiles) }));
      } else if (typeof obj === "object" && !Array.isArray(obj) && Object.hasOwn(obj, "profiles")) {
        set({ profiles: obj.profiles });
      } else {
        set({ profiles: obj });
      }
    },

    setOptions: (obj) => {
      if (typeof obj === "object" && !Array.isArray(obj) && Object.hasOwn(obj, "options")) {
        set({ options: obj.options });
      } else {
        set({ options: obj });
      }
    },

    setProfile: (profile) => set(withInData({ profile })),
    setTableIdx: (tableIdx) => set(withInData({ tableIdx })),

    updateProfileList: (profile) => set((state) => {
      const updatedProfiles = [...state.profiles];
      const index = updatedProfiles.findIndex((p) => p.id === profile.id);
      updatedProfiles[index] = profile;
      return { profiles: updatedProfiles };
    }),

    updateProfile: (nextProfile, { updateList = false } = {}) => {
      set(withInData({ profile: { ...nextProfile } }));
      if (updateList) {
        get().updateProfileList(nextProfile);
      }
    },

    initialize: (isAdmin) => {
      if (!isAdmin) {
        ConverterApi.fetchProfiles(isAdmin).then((profilesResponse) => {
          get().setProfiles(profilesResponse);
          set({ datasets: [], options: [] });
        });
        return;
      }

      Promise.all([
        ConverterApi.fetchProfiles(isAdmin),
        ConverterApi.fetchDatasets(),
        ConverterApi.fetchOptions(),
        ConverterApi.fetchDatasetsUnits()
      ]).then((responses) => {
        const [profilesResponse, datasetsResponse, optionsResponse] = responses;
        get().setProfiles(profilesResponse);
        get().setDatasets(datasetsResponse);
        get().setOptions(optionsResponse);
      });
    }
  };
});

// Backwards-compatible hook. Pass a selector to subscribe to just the slice of
// state a component needs; the shallow comparison keeps object selectors stable
// so a component only re-renders when its own slice changes.
export function useAdminApp(selector) {
  return useAdminStore(useShallow(selector ?? ((state) => state)));
}

export function AdminProvider({ children, isAdmin }) {
  const initialize = useAdminStore((state) => state.initialize);

  useEffect(() => {
    initialize(isAdmin);
  }, [isAdmin, initialize]);

  return children;
}

AdminProvider.propTypes = {
  isAdmin: PropTypes.bool.isRequired
}
