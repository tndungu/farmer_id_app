import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFarmers } from "./useFarmers";
import { useFarmersTemp } from "./useFarmersTemp";

export const cleanUp = async () => {
  const version = await AsyncStorage.getItem("version");

  if (version !== "1.0.19") {
    const { setExistingFarmers } = await useFarmers();
    const { setExistingFarmersTemp } = await useFarmersTemp();

    const empty = [];
    setExistingFarmers(JSON.stringify(empty));
    setExistingFarmersTemp(JSON.stringify(empty));
    await AsyncStorage.setItem("version", "1.0.19");
    await AsyncStorage.setItem("NetworkStatus_Pull","2022-09-01");
  }
};
