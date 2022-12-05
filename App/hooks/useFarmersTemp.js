import AsyncStorage from "@react-native-async-storage/async-storage";

const setFarmerListTemp = async (farmers) => {
  await AsyncStorage.setItem("farmers_LocalTemp_EA", farmers);
};

export const useFarmersTemp = async () => {
  let farmerList = null;
  farmerList = await AsyncStorage.getItem("farmers_LocalTemp_EA");

  const res = {
    existingFarmersTemp: farmerList,
    setExistingFarmersTemp: setFarmerListTemp,
  };
  return res;
};
