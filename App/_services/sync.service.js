import AsyncStorage from "@react-native-async-storage/async-storage";

export const getInitialRouteName = async() => {
    let route = null
    const oneDay = new Date().getTime() - (24 * 60 * 60 * 1000)
    return new Promise(async (resolve,reject) => {
      const lastSync = await AsyncStorage.getItem("NetworkStatus_Pull")
      if(lastSync == null){
        await AsyncStorage.setItem("NetworkStatus_Pull","2022-08-07")
      }
      const lastSyncTime = new Date(lastSync)

      if(lastSyncTime < oneDay) route = 'Settings'
      else route = 'Home'

      resolve(route)
    })
  }