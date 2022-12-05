import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, Modal, Keyboard, ActivityIndicator, } from "react-native";
import { Icon } from "react-native-elements";
import Colors from "../config/colors.js";
import { Card } from "../shared/card.js";
import { TopBar } from "../components/TopBar.js"
import AddEditFarmerScreen from "./AddEditFarmerScreen.js";
import { LinearGradient } from "expo-linear-gradient";
import { BarCodeScanModal } from "../components/BarCodeScanModal.js";
import AwesomeAlert from "react-native-awesome-alerts";
import { useTranslation } from 'react-i18next'
import { useFarmersTemp } from "../hooks/useFarmersTemp.js";
import openDb from "../_services/database.service.js";
import { useFarmers } from "../hooks/useFarmers.js";
import { Alert } from "react-native";

const HomeScreen = ({ route, navigation }) => {
  const [farmer, setFarmer] = useState({});
  const [noFarmerRecord, setNoFarmerRecord] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [farmersList, setFarmersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [minCharacters, setMinCharacters] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const { t } = useTranslation();

  const userIdChanged = (farmerId) => {
    setFarmer((prev) => ({ ...prev, farmerID: farmerId }));
    SearchFarmerByUserId(farmerId);
  };

  useEffect(() => {
    (async () => {
      const { existingFarmersTemp, setExistingFarmersTemp } =
        await useFarmersTemp();

      if (!existingFarmersTemp) {
        setExistingFarmersTemp(JSON.stringify([]));
      }
      setFarmersList([]);
    })();
  }, []);

  const onChangeSearchText = (e) => {
    setSearchText(e);
  };

  const filterFarmers = async (farmer, farmerList) => {
    if (farmerList !== null) {
      let query = farmer.toLowerCase();
      return farmerList.filter(
        (item) =>
          item.farmerID?.toLowerCase()?.indexOf(query) > -1 ||
          item.first_name?.toLowerCase()?.indexOf(query) > -1 ||
          item.Surname?.toLowerCase()?.indexOf(query) > -1
      );
    }
  };

  const SearchFarmerByName = async () => {
    setMinCharacters(false);

    Keyboard.dismiss();
    if (searchText.length < 3) {
      setMinCharacters(true);
      return;
    }

    const searchTextTrimmed = searchText.trim();
    
    setIsLoading(true);
    setNoFarmerRecord(false);
    setFarmersList([]);
    console.log("start searching");
    try {
      const { existingFarmersTemp } = await useFarmersTemp();
      const {existingFarmers } = await useFarmers()

      let localFarmerList = [];
      let existingFarmersJson = null;
      let res = null;

      if (existingFarmersTemp) {
        res = JSON.parse(existingFarmersTemp);
        if(res.length > 0)
          localFarmerList = await filterFarmers(searchTextTrimmed, res);
      }
      if(existingFarmers){
        existingFarmersJson = JSON.parse(existingFarmers);
      }

      const tempRecords = [];
      let farmerExists = [];
      
      if (existingFarmersJson !== null)
        farmerExists = await filterFarmers(searchTextTrimmed, existingFarmersJson);
        
      if (localFarmerList.length > 0)
        setFarmersList((prev) => [...prev, ...localFarmerList]);
      if (farmerExists && farmerExists.length > 0) {
        const tempExists = [];

        for (const record of farmerExists) {
          if (localFarmerList.findIndex((x) => x.id == record.id) === -1)
            tempExists.push(record);
        }
        setFarmersList((prev) => [...prev, ...tempExists]);
      }

      const db = await openDb();
  
      let dbClosed = db?._db?._closed;
      if(dbClosed){
        Alert.alert("Cannot Access the database");
        return;
      }

      db.transaction((tx) => {
        console.log("inside transaction",tx);

        tx.executeSql(
          `SELECT * FROM Farmer WHERE first_name LIKE '%${searchTextTrimmed}%' OR Surname LIKE '%${searchTextTrimmed}%' OR farmerID LIKE '%${searchTextTrimmed}%' LIMIT 1000`,
          [],
          (tx, result) => {
            console.log("Result is ",result);
            var len = result.rows.length;
            if (len > 0) {
              for (let i = 0; i < len; i++) {
                if (existingFarmersJson &&
                  existingFarmersJson.findIndex(
                    (x) => x.id == result.rows.item(i).id
                  ) === -1 &&
                  res.findIndex((x) => x.id == result.rows.item(i).id) === -1
                ) {
                  tempRecords.push(result.rows.item(i));
                }
              }
              setFarmersList((prev) => [...prev, ...tempRecords]);
            } else {
              if (
                farmersList.length == 0 &&
                farmerExists.length == 0 &&
                localFarmerList.length == 0
              )
                setNoFarmerRecord(true);

              setIsLoading(false);
            }
          },
          (tx, error) => {
            setIsLoading(false);
            Alert.alert("error ocured inside Executesql: ",error);
            //console.log("error ocured inside Executesql",error);
            
          },
          (tx, error) => {
            setIsLoading(false);
            Alert.alert("Search by Id inside Error: ",error);
            // console.log("error ocured inside other error",error);
            
          }
        )
      }
      );
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Search Error: ",error);
      console.log("error",error)
    }
    console.log("End searching");
  };

  const SearchFarmerByUserId = async (userId) => {
    setMinCharacters(false);

    if (userId.length < 3) {
      setMinCharacters(true);
      return;
    }
   
    console.log("Searching by user id:",userId);

    setNoFarmerRecord(false);
    setIsLoading(true);

    const { existingFarmersTemp } = await useFarmersTemp();
    const {existingFarmers } = await useFarmers()

    let farmer = [];
    let existingFarmersJson = null;

    if (existingFarmersTemp) {
      const res = JSON.parse(existingFarmersTemp);
      farmer = res.filter((x) => x.farmerID.indexOf(userId) > -1);
    }
    if(existingFarmers){
      existingFarmersJson = JSON.parse(existingFarmers);
    }

    const tempRecords = [];

    if (farmer.length > 0) setFarmersList((prev) => [...prev, ...farmer]);

    let farmerExists = [];
    if (existingFarmersJson !== null)
      farmerExists = await filterFarmers(userId, existingFarmersJson);

    if (farmerExists && farmerExists.length > 0) {
      const tempExists = [];

      for (const record of farmerExists) {
        if (farmer.findIndex((x) => x.id == record.id) === -1)
          tempExists.push(record);
      }
      setFarmersList((prev) => [...prev, ...tempExists]);
    }
    try {
      const db = await openDb();
      db.transaction((tx) =>
        tx.executeSql(
          `SELECT * FROM Farmer WHERE farmerID LIKE '${userId}%' LIMIT 1000`,
          [],
          (tx, result) => {
            console.log("Result is UserId ",result);
            var len = result.rows.length;
            if (len > 0) {
              for (let i = 0; i < len; i++) {
                if (
                  res.findIndex((x) => x.id == result.rows.item(i).id) === -1 &&
                  existingFarmersJson.findIndex(
                    (x) => x.id == result.rows.item(i).id
                  ) === -1
                ) {
                  tempRecords.push(result.rows.item(i));
                }
              }
              setFarmersList((prev) => [...prev, ...tempRecords]);
            } else {
              if (
                farmersList.length == 0 &&
                farmerExists.length == 0 &&
                farmer.length == 0
              )
                setNoFarmerRecord(true);
            }
          },
          (tx, error) => {
            Alert.alert("Search by Id Executesql Error: ",error);
            // console.log("error ocured inside Executesql",error);
            setIsLoading(false);
          },
          (tx, error) => {
            Alert.alert("Search by Id inside Error: ",error);
            // console.log("error ocured inside other error",error);
            setIsLoading(false);
          }
        )
      );
    } catch (error) {
      Alert.alert("Search by Id Error: ",error);
      setIsLoading(false);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const EditFarmer = (item) => {
    setFarmer(item);
    setisEditFarmerModalVisible(true);
  };
  const [isRender, setisRender] = useState(true);
  const [isEditFarmerModalVisible, setisEditFarmerModalVisible] =
    useState(false);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity key={index} onPress={() => EditFarmer(item)}>
      <Card>
        <Text>
          {t("Farmer ID")}: {item.farmerID}
        </Text>
        <Text>
          {t("Name")}: {item.first_name} {item.Surname}
        </Text>
        <Text>
          {t("Date of Birth")}: {item.Birth_date}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar style={{ height: 20 }} />
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setisModalVisible(true);
            setSearchText("");
            setFarmersList([]);
          }}
          disabled={isLoading}
        >
          <Text>
            {t("Scan")} {t("Farmer ID")}
          </Text>
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <View style={styles.searchWrapper}>
            <Icon
              style={styles.searchIcon}
              name="search"
              size={20}
              color="#000"
            />
            <TextInput
              style={styles.searchInput}
              onChangeText={onChangeSearchText}
              placeholder={t("Search")}
              value={searchText}
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              SearchFarmerByName();
            }}
            disabled={isLoading}
          >
            {!isLoading && <Text>{t("Search")}</Text>}
            {isLoading && (
              <ActivityIndicator animating={true} size="large" color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.recordsFoundText}>
        {farmersList.length > 0 && 
          <Text style={{marginLeft: 20, color:'red'}}>
            {t(`${farmersList.length} records found`)}
          </Text>
        }
        </View>
      </View>
      {noFarmerRecord && (
        <Text style={{ marginTop: 50, color: "red" }}>
          {t("farmer record does not exist")}
        </Text>
      )}
      {minCharacters && (
        <Text style={{ marginTop: 50, color: "red" }}>
          {t("please enter atleast 3 characters")}
        </Text>
      )}
      <View style={styles.flatListView}>
        {!isLoading && (
          <FlatList
            data={farmersList}
            style={styles.flatList}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={renderItem}
            extraData={isRender}
          />
        )}
        <Modal
          animationType="fade"
          visible={isEditFarmerModalVisible}
          onRequestClose={() => setisEditFarmerModalVisible(false)}
          style={styles.modalView}
          SetItem={(item) => setFarmer(item)}
        >
          <LinearGradient
            start={{ x: 0.1, y: 0.2 }}
            colors={[Colors.primary, Colors.primary]}
            style={styles.linearGradient}
          >
            <View style={styles.headerWrap}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Home");
                  setisEditFarmerModalVisible(false);
                }}
              >
                <Icon name="arrow-back" color="#fff" size={30} />
              </TouchableOpacity>
              <Text style={styles.textField}>{t("Edit Farmer")}</Text>
            </View>
          </LinearGradient>
          <View style={{ flex: 7 }}>
            <AddEditFarmerScreen
              farmerData={farmer}
              navigation={navigation}
              setShowAlert={setShowAlert}
            />
          </View>
          <AwesomeAlert
            show={showAlert}
            showProgress={false}
            title={t("Saved")}
            message={t("Farmer record saved successfully")}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            confirmText={t("OK")}
            confirmButtonColor={Colors.primary}
            confirmButtonStyle={{ width: 100, alignItems: "center" }}
            animatedValue={1}
            modalProps={{ navigation: navigation }}
            onConfirmPressed={() => {
              setShowAlert(false);
              setisEditFarmerModalVisible(false);
              setFarmersList([]);
            }}
          />
        </Modal>
        <BarCodeScanModal
          userIdChanged={userIdChanged}
          isModalVisible={isModalVisible}
          setisModalVisible={setisModalVisible}
        />
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
  error: {
    color: "red",
  },
  modalView: {
    margin: 0,
    padding: 0,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 6,
    position: "absolute",
    top: 0,
    justifyContent: "center",
    zIndex: 2,
    height: 110,
    width: 300,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowRadius: 2,
    marginHorizontal: 4,
    marginVertical: 6,
    marginBottom: 3,
    backgroundColor: "#fff",
  },
  button: {
    height: 30,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    margin: 10,
    color: Colors.primary,
    borderRadius: 6,
  },
  flatList: {
    marginTop: 40,
    flex: 1,
    marginLeft: 30,
  },
  flatListView: {
    flex: 3,
    flexDirection: "row",
    backgroundColor: Colors.white,
    width: "100%",
  },
  searchButton: {
    height: 30,
    width: 100,
    marginLeft: 10,
    backgroundColor: Colors.primary,
    color: Colors.black,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    height: 30,
    width: 150,
  },
  footer: {
    flex: 0.4,
    backgroundColor: Colors.white,
    height: 50,
    borderWidth: 1,
    borderColor: "thistle",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    borderWidth: 1,
    borderColor: "lightgray",
    flexDirection: "row",
    borderRadius: 5,
  },
  searchIcon: {
    flex: 1,
    justifyContent: "center",
  },
  linearGradient: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 0,
  },
  recordsFoundText:{
    flex:1,
    alignItems:"center",
    flexDirection:"row",
    paddingRight: 10
  },
  headerWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 30,
  },
  textField: {
    fontSize: 26,
    color: "#fff",
    marginLeft: 50,
  },
});

export default HomeScreen;
