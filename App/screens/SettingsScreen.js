import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { TopBar } from "../components/TopBar";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../config/colors";
import { PullFarmersFromServer, PushLocalFarmerRecords } from "../_services/farmer.service";
import { useNetInfo } from "@react-native-community/netinfo";
import { getInitialRouteName } from "../_services/sync.service";
import { useLanguage } from "../hooks/useLanguage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFarmersTemp } from "../hooks/useFarmersTemp";


const SettingsScreen = () => {
  const [currLanguage,setCurrLanguage] = useState('en')

  const [isLangChanged, setIsLangChanged] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [syncRecordCount,setSyncRecordCount] = useState(0);
  const [syncPushRecordCount, setSyncPushRecordCount] = useState(0);

  const { t } = useTranslation();
  const netInfo = useNetInfo();

  useEffect(() => {
    (async () => {
       const { language } = await useLanguage()
       setCurrLanguage(language)

      const sync = await getInitialRouteName();
      if (sync == "Settings") setSyncError(true);

      setSyncComplete(false);
      setIsLangChanged(false);
    })();
  }, []);

  const changeLanguage = async (lang) => {
    const { setLanguage } = await useLanguage()
    setLanguage(lang);
    setIsLangChanged(true);
  };
  const SyncData = async () => {
    try {
      setIsSyncing(true);
      setSyncComplete(false);
      if (netInfo.type == "wifi" || netInfo.type == "cellular") {
        const { existingFarmersTemp } = await useFarmersTemp();
        console.log("existingFarmersTemp count is: ",existingFarmersTemp);
        if(existingFarmersTemp != null){
          var jsonFarmerList = JSON.parse(existingFarmersTemp);
          setSyncPushRecordCount(jsonFarmerList?.length);
        }
        await PushLocalFarmerRecords();

        setTimeout(() => {
          PullFarmersFromServer()
          .then(async result => {
           let recordCount = await AsyncStorage.getItem("recordCount");
           console.log("Results are ",recordCount);
           setSyncRecordCount(recordCount);
           setSyncComplete(true);
           setIsSyncing(false);
           setSyncError(false);
          })
          .catch((error) => {
           console.log("Error happened",error)
          });
        }, 10000);
      } else {
        setIsSyncing(false);
        setSyncError(true);
      }

    } catch (error) {
      console.log("error in settings sync: ", error);
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <View style={styles.bodyWrapper}>
        <View style={styles.wrapper}>
          <Text style={styles.label}>Language</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={currLanguage}
              onValueChange={(itemValue, itemIndex) =>
                changeLanguage(itemValue)
              }
              style={styles.picker}
              itemStyle={styles.pickerItemStyle}
              mode="dropdown"
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="Portuguese" value="pt" />
              <Picker.Item label="Nyanja" value="ny" />
              <Picker.Item label="Swahili" value="sw" />
            </Picker>
          </View>
        </View>
        {isLangChanged && (
          <Text style={{ color: "#d92c23", padding: 10 }}>
            {t(
              "Language changed. Please logout then restart the app for changes to take effect"
            )}
          </Text>
        )}
        <View style={styles.wrapper}>
          <Text style={styles.label}>{t("Sync Data")}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              SyncData();
            }}
          >
            {!isSyncing && <Text>Sync</Text>}
            {!isSyncing && (
              <Ionicons name="sync-outline" size={22} color={colors.primary} />
            )}
            {isSyncing && (
              <ActivityIndicator animating={true} size="large" color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        {syncError && (
          <View>
            <Text style={{ color: "#d92c23", padding: 10 }}>
              {t(
                "There has been no data sync in the past 24 hours. Please ensure there is internet connection and click Sync button"
              )}
            </Text>
          </View>
        )}
        {syncComplete && (
          <View>
            <Text
              style={{
                color: "#c46c14",
                padding: 10,
                alignItems: "center",
                fontSize: 18,
              }}
            >
              {t(`Data sync completed. ${syncRecordCount || 0} records imported. ${syncPushRecordCount || 0} records pushed to the server.`)}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 0,
    marginBottom: 0,
  },
  bodyWrapper: {
    flex: 4,
    flexDirection: "column",
    width: "100%",
  },

  button: {
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#faeab4",
    marginBottom: 30,
    marginTop: 5,
    marginLeft: 10,
    padding: 10,
    color: colors.primary,
    height: 40,
    width: "60%",
    borderRadius: 10,
    flexDirection: "row",
  },
  wrapper: {
    flexDirection: "row",
  },
  label: {
    color: "#000",
    fontSize: 18,
    marginLeft: 10,
    marginTop: 20,
    fontWeight: "500",
  },
  pickerWrapper: {
    borderWidth: 1,
    margin: 10,
    padding: 10,
    borderRadius: 5,
    width: "60%",
    height: 40,
    borderColor: "thistle",
    justifyContent: "center",
  },
});
export default SettingsScreen;
