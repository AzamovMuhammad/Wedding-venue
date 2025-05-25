import {create} from "zustand";

const useVenueStore = create((set) => ({
  venueId: null,
  setVenueId: (id) => set({ venueId: id }),
}));

export default useVenueStore;
