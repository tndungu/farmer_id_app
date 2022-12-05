import AsyncStorage from "@react-native-async-storage/async-storage";

const setFarmerList = async (farmers) => {
  await AsyncStorage.setItem("farmers_EA", farmers);
};

export const useFarmers = async () => {
  let farmerList = null;
  farmerList = await AsyncStorage.getItem("farmers_EA");

  const res = {
    existingFarmers: farmerList,
    setExistingFarmers: setFarmerList,
  };
  return res;
};

