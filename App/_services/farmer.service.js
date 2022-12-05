import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../api/config";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import * as RootNavigation from "../navigation/RootNavigation";
import { useFarmers } from "../hooks/useFarmers";
import { useFarmersTemp } from "../hooks/useFarmersTemp";
import { AddFarmerRecord } from './database.service';

const BACKGROUND_FETCH_TASK = "background-fetch";

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log("Initiate background task");

  const unsubscribe = NetInfo.addEventListener(async (state) => {
    const date = new Date().toISOString();

    if (state.type == "wifi" || state.type == "cellular") {
      await PushLocalFarmerRecords();
      await PullFarmersFromServer();
    }
  });
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export const PushLocalFarmerRecords = async () => {
  const { existingFarmersTemp, setExistingFarmersTemp } =
    await useFarmersTemp();

  var jsonFarmerList = JSON.parse(existingFarmersTemp);

  if (jsonFarmerList && jsonFarmerList.length > 0) {
    getFarmerRequestObject(jsonFarmerList)
      .then(async (request) => {

        GetToken()
          .then((responseToken) => {
            if (!responseToken) return RootNavigation.navigate("Login");

            const headerConfig = getHeaderConfig(responseToken);

            axios
              .put(`${config.apiUrl}`, request, headerConfig)
              .then((response) => {
                if (response?.status === 200) {
                  setExistingFarmersTemp(JSON.stringify([]));
                }
              })
              .catch((error) => {
                console.log("Error from axios", error.response);
                RootNavigation.navigate("Login");
              });
          })
          .catch((error) => {
            console.log("Error getting token", error.response);
            RootNavigation.navigate("Login");
          });
      })
      .catch((error) => {
        console.log("Error getting the Push records", error);
      });
  }
};

function getHeaderConfig(token){
  const headConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return headConfig;
};

const getAccessHeaderConfig = async () => {
  const token = await AsyncStorage.getItem("token");

  const headConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return headConfig;
};

const GetToken = async function getToken(){
  return new Promise(async (resolve,reject) =>{
    const userName = await AsyncStorage.getItem("LoggedIn");
    const userPassword = await AsyncStorage.getItem("LoggedInPassword");

    const obj = {
      staff_id: userName,
      password: userPassword,
    };
    const header = await getAccessHeaderConfig();

    axios
      .post(`${config.jwtUrl}create/`, JSON.stringify(obj),header)
      .then((res) => {
        if (res?.status === 200) {
            resolve(res.data.access);
        } else {
          reject(null);
          console.log("Invalid login user");
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          RootNavigation.navigate("Login");
          reject(null);
        }
      });
  });
};

const GetRecordCount = async function (headerConfig) {
  const networkStatusPull = await AsyncStorage.getItem("NetworkStatus_Pull");
  const startDate = networkStatusPull
    ? networkStatusPull.split("T")[0]
    : "2022-07-16";

  return new Promise((resolve, reject) => {
    axios
      .get(`${config.apiUrl}?start_date=${startDate}`, headerConfig)
      .then((res) => {
        if (res?.status === 200) {
          resolve(res?.data?.count);
        }
      })
      .catch((error) => {
        reject(null);
      });
  });
};

export const PullFarmersFromServer = async () => {
  const networkStatusPull = await AsyncStorage.getItem("NetworkStatus_Pull");
  const startDate = networkStatusPull
    ? networkStatusPull.split("T")[0]
    : "2022-07-16";

  const {existingFarmers,setExistingFarmers } = await useFarmers();

  let res = null
  if(existingFarmers) res = JSON.parse(existingFarmers);
  let farmerRecordsJson = [];

  if (res !== null) farmerRecordsJson = res;
  GetToken()
  .then(responseToken => {
    if(!responseToken) return RootNavigation.navigate("Login");
    
    const headerConfig = getHeaderConfig(responseToken);

    GetRecordCount(headerConfig)
    .then(async (recordCount) => {
      const pagesCount = Math.ceil(recordCount/100);
      AsyncStorage.setItem("recordCount",`${recordCount}`);

      for(let page=1;page<=pagesCount;page++){
         new Promise((resolve,reject) => {
          try{
            axios
      .get(`${config.apiUrl}?start_date=${startDate}&page=${page}`, headerConfig)
      .then(async (res) => {
        if (res?.status === 200) {
          const result = res?.data?.results;
             if (result.length > 0) {
              var res = await AddFarmerRecord(result);
          }
         resolve(result.length)
        }
      })
      .catch(async (error) => {
        reject(error.response);
      });
      
        }catch{
          reject("Error occured, please check connection");
        }
        })
      }

     const todayDate = new Date().toISOString();
        await AsyncStorage.setItem("NetworkStatus_Pull", todayDate);
      
    })
  })
};

export const backgroundTasks = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_FETCH_TASK
  );
  if (!isRegistered) await registerBackgroundFetchAsync();
};

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 5,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

const getFarmerRequestObject = async (jsonFarmerList) => {
  return new Promise(async (resolve, reject) => {
    const user = await AsyncStorage.getItem("LoggedIn");
    const date = new Date().toISOString().split("T")[0];
    const result = [];

    jsonFarmerList.forEach((farmer) => {
      const {
        showreplacement_reason,
        Modification_In_Progress,
        DTStamp,
        ...rest
      } = farmer;
      farmer = rest;
      result.push({
        ...farmer,
        verified_farmerID: "True",
        verified_date: date,
        staffID: user,
      });
    });

    const res = JSON.parse(JSON.stringify(result));
    resolve(res);
  });
};

