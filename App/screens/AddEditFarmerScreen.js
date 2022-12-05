import React, { useEffect, useState } from "react";
import { View,ScrollView,TextInput,Text, SafeAreaView,StyleSheet,TouchableOpacity, Pressable, ActivityIndicator,Alert} from "react-native";
import { Formik } from "formik";
import colors from "../config/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import {Picker} from "@react-native-picker/picker";
import MapView, { Circle, Marker, LocalTile } from "react-native-maps";
import * as Location from 'expo-location'
import * as Yup from 'yup'
import { BarCodeScanModal } from "../components/BarCodeScanModal";
import { useTranslation } from "react-i18next"
import {SearchFarmerByUserId_ExactMatch } from '../_services/database.service'
import { useFarmersTemp } from "../hooks/useFarmersTemp";
import * as FileSystem from 'expo-file-system';

const AddEditFarmerScreen = ({farmerData, setShowAlert }) => { 
  const {t } = useTranslation()

  const [isLoading,setIsLoading] = useState(false)
  const [isModalVisible, setisModalVisible] = useState(false);
  const [showDatePicker,setShowDatePicker] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [cardAlreadyIssued,setCardAlreadyIssued] =useState(false)
  const [searchingCardNumber,setSearchingCardNumber] = useState(false)
  
  const [farmer,setFarmer] = useState({...farmerData,replacement_reason: "",showreplacement_reason: false});

  // useEffect(() => {
  //   console.log("dateofBirth is: ",dateofBirth);
  // },[]);

  const userIdChanged = async (userId) => {
    setSearchingCardNumber(true)
    setCardAlreadyIssued(false)
     const duplicateExists = await SearchFarmerByUserId_ExactMatch(userId)
     if(duplicateExists){
      setCardAlreadyIssued(true)
     }else{
       setCardAlreadyIssued(false)
      setFarmer((prev) => ({...prev,farmerID: userId.toString(),replacement_reason:"duplicate", showreplacement_reason:true}))
     }
     setSearchingCardNumber(false)
  }
  const farmerCoordinates = farmerData.Please_pinpoint_the_tion_is_taking_place
  const [location, setLocation] = useState(null)
  const [pin, setPin] = useState(null)

  const dt = new Date(farmer.Birth_date);
  const [dateofBirth,setDateofBirth] = useState(dt)

  const validationSchema = Yup.object().shape({
    farmerID: Yup.string()
    .required(`${t('Farmer ID')} ${t("is required")}`)
    .nullable(),
    Gender: Yup.string().required(`${t("Gender")} ${t("is required")}`)
    .nullable(),
    first_name: Yup.string().required(`${t("First Name")} ${t("is required")}`).nullable(),
    Surname: Yup.string().required(`${t("Surname")} ${t("is required")}`)
    .nullable(),
    showreplacement_reason: Yup.boolean(),
    replacement_reason: Yup.string().when("farmerID", {
      is:true,
      then: Yup.string().min(2,t("Please select Replacement Reason"))
    }),
  });

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateofBirth;

    console.log("dateofBirth",dateofBirth);
    console.log("currentDate",currentDate);
    
    setDateofBirth(currentDate);
    setShowDatePicker(false);
  };

  useEffect(() => {
    (async () => {
      setCardAlreadyIssued(false);
      setShowMap(false);

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status != "granted") {
        Alert.alert(t("Permission to access location was denied. Please allow access from phone settings"));
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc?.coords);

      if(loc !== null){
        setPin({
          latitude: loc?.coords?.latitude,
          longitude: loc?.coords?.longitude,
          altitude: loc?.coords?.altitude
        });
      }

      if (!farmerCoordinates || farmerCoordinates === "None") {
        setShowMap(true);
        
        setFarmer((prev) => ({
          ...prev,
          Please_pinpoint_the_tion_is_taking_place: `${loc?.coords?.latitude} ${loc?.coords?.longitude} ${loc?.coords?.altitude} ${loc?.coords?.accuracy}`,
        }));
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    const {existingFarmersTemp, setExistingFarmersTemp } = await useFarmersTemp()
    setIsLoading(true);
    const farmersList = JSON.parse(existingFarmersTemp) || [];

    console.log("the farmer is:",e);

    if (farmersList?.length == 0) {
      farmersList.push(e);
    } else {
      let index = farmersList.findIndex((x) => x.id == e.id);
      if (index === -1) farmersList.push(e);
      else farmersList[index] = e;
    }

    setExistingFarmersTemp(JSON.stringify(farmersList))

    setShowAlert(true);
    setIsLoading(false);
  };

  const pathTemplate = `${FileSystem.documentDirectory}/map-tiles/{z}/{x}/{y}.png`
  
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.editForm}>
        <Formik
          initialValues={farmer}
          onSubmit={(values) => handleSubmit(values)}
          validationSchema={validationSchema}
          enableReinitialize
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            isValid,
          }) => (
            <ScrollView style={styles.inputView}>
              <Text style={styles.label}>{t('farmer id')}</Text>
              <TextInput
                onBlur={handleBlur("farmerID")}
                value={farmer.farmerID ?? ""}
                defaultValue={values.farmerID ?? ""}
                onChangeText={(event) => {
                  setFieldValue("farmerID", event);
                  setFarmer((prev) => ({
                    ...prev,
                    farmerID: event,
                    showreplacement_reason: true,
                  }));
                }}
                editable={false}
                maxLength={200}
                multiline={false}
                style={[
                  styles.inputText,
                  errors.farmerID
                    ? { borderColor: "red" }
                    : { borderColor: "thistle" },
                ]}
              />
              {errors.farmerID && (
                <Text style={styles.error}>{errors.farmerID}</Text>
              )}
              {
                cardAlreadyIssued && (
                  <Text style={styles.error}>{t("Card cannot be issue already exists")}</Text>
                )}
              <TouchableOpacity
                style={styles.issueCardButton}
                onPress={() => {
                  setisModalVisible(true);
                }}
                disabled={searchingCardNumber}
              >
                {searchingCardNumber && (<ActivityIndicator animating={true} size="large" color="#fff"/>)}
                {!searchingCardNumber && <Text style={{ fontSize: 16, color: "red" }}> {t("Issue New Card")} </Text>}
              </TouchableOpacity>
              {farmer.showreplacement_reason && (
                <View>
                  <Text style={styles.label}>{t("Replacement Reason")}</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={farmer.replacement_reason}
                      onValueChange={(itemValue, itemIndex) =>{
                        setFieldValue('replacement_reason',itemValue)
                         setFarmer((farmer) => ({ ...farmer, replacement_reason: itemValue }))
                      }}
                      style={styles.picker}
                      itemStyle={styles.pickerItemStyle}
                      mode="dropdown"
                    >
                      <Picker.Item label={t("Duplicate")} value="duplicate" />
                      <Picker.Item label={t("New Card")} value="newcard" />
                      <Picker.Item label={t("Misplaced")} value="misplaced" />
                    </Picker>
                  </View>
                  {errors.replacement_reason && (
                    <Text style={styles.error}>{errors.replacement_reason}</Text>
                  )}
                </View>
              )}

              <Text style={styles.label}>{t("First Name")}</Text>
              <TextInput
                onChangeText={handleChange("first_name")}
                onBlur={handleBlur("first_name")}
                value={values.first_name}
                style={[
                  styles.inputText,
                  errors.first_name
                    ? { borderColor: "red" }
                    : { borderColor: "thistle" },
                ]}
              />
              {errors.first_name && (
                <Text style={styles.error}>{errors.first_name}</Text>
              )}
              <Text style={styles.label}>{t("Surname")}</Text>
              <TextInput
                onChangeText={handleChange("Surname")}
                onBlur={handleBlur("Surname")}
                value={values.Surname}
                style={[
                  styles.inputText,
                  errors.Surname
                    ? { borderColor: "red" }
                    : { borderColor: "thistle" },
                ]}
              />
              {errors.Surname && (
                <Text style={styles.error}>{errors.Surname}</Text>
              )}
              <Text style={styles.label}>{t("Date of Birth")}</Text>
              <Pressable onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    onChangeText={handleChange("Birth_date")}
                    value={values.Birth_date}
                    style={styles.inputText}
                    editable={false}
                  />
                </View>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={dateofBirth}
                  style={{ width: 200, height: 50 }}
                  mode="date"
                  placeholder={t("select date")}
                  format="YYYY-MM-DD"
                  display="default"
                  // maxDate={new Date()}
                  onChange={(event, selectedDate) => {
                    console.log("selectedDate",selectedDate);
                    console.log("event",event);
                    if(selectedDate !== undefined){
                      setFieldValue("Birth_date", selectedDate.toString());
                      onDateChange(event, selectedDate);
                    }
                  }}
                  // androidMode="calendar"
                  // duration={300}
                  // is24Hour={true}
                />
              )}
              <Text style={styles.label}>{t("Gender")}</Text>
              <View
                style={[
                  styles.pickerWrapper,
                  errors.Gender
                    ? { borderColor: "red" }
                    : { borderColor: "thistle" },
                ]}
              >
                <Picker
                  selectedValue={farmer.Gender ?? ""}
                  onValueChange={(itemValue, itemIndex) =>{
                    setFieldValue('Gender',itemValue)
                    setFarmer((farmer) => ({ ...farmer, Gender: itemValue }))
                  }
                    
                  }
                  style={styles.picker}
                  itemStyle={styles.pickerItemStyle}
                  mode="dropdown"
                >
                  <Picker.Item label={t("Select Gender")} value="" />
                  <Picker.Item label={t("Male")} value="male" />
                  <Picker.Item label={t("Female")} value="female" />
                </Picker>
                {errors.Gender && (
                  <Text style={styles.error}>{errors.Gender}</Text>
                )}
              </View>
              <Text style={styles.label}>{t("Contact Number")}</Text>
              <TextInput
                onChangeText={handleChange("Contact_number")}
                onBlur={handleBlur("Contact_number")}
                value={values.Contact_number?.toString()}
                style={styles.inputText}
              />
              {showMap && location && (
                <View>
                  <Text style={styles.label}>{t("Location")}</Text>
                  <View style={styles.geoLocation}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: location?.latitude,
                        longitude: location?.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}
                      mapType="satellite"
                      showsUserLocation={true}
                      onUserLocationChange={(e) => {
                        
                      }}
                    >
                    <LocalTile
                      pathTemplate={pathTemplate}
                      tileSize={256}
                    />
                      {pin && (
                        <Marker
                          coordinate={pin}
                          title={t("Farmer")}
                          pinColor="red"
                          draggable={true}
                          onDragStart={(e) => {
                            // console.log(
                            //   e.nativeEvent.coordinate
                            // );
                          }}
                          onDragEnd={(e) => {
                            console.log(
                              "Dragging marker..",
                              e.nativeEvent?.coordinate
                            );
                            setPin({
                              latitude: e?.nativeEvent?.coordinate?.latitude,
                              longitude: e?.nativeEvent?.coordinate?.longitude,
                              altitude: e?.nativeEvent?.coordinate?.altitude,
                              accuracy: e.nativeEvent.coordinate.accuracy
                            });
                          }}
                        ></Marker>
                      )}
                      {pin && <Circle center={pin} radius={300} />}
                    </MapView>
                  </View>
                </View>
              )}
              <View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={(e) => handleSubmit(e)}
                  title={t("Submit")}
                  disabled={!isValid}
                >
                  {isLoading && <ActivityIndicator animating={true} size="large" color="#fff"/>}
                  {!isLoading && <Text style={{ fontSize: 16 }}> {t("CONFIRM")} </Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Formik>
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
  safeAreaView: {
    flex: 1,
    alignItems: "center",
  },
  error:{
    color:'red',
    marginLeft:10
  },
  geoLocation:{
    flex:1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent:'center',
    marginLeft:10,
    width: '90%',
    height:300,
    margin:10,
  },
  map:{
    width: '100%',
    height: '100%'
  },
  label: {
    color: "#000",
    fontSize: 16,
    marginTop: 10,
    marginLeft: 10,
    borderColor: "red",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: 30,
    marginTop: 5,
    color: colors.primary,
    height: 40,
    width: "90%",
    borderRadius: 25,
  },
  issueCardButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginLeft: 10,
    marginTop: 5,
    marginBottom: 10,
    color: "#000",
    fontSize: 22,
    width: "60%",
    height: 30,
    borderRadius: 25,
  },
  inputText: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "thistle",
    margin: 10,
    padding: 10,
    height: 40,
    borderRadius: 5,
    width: "90%",
  },
  inputView: {
    width: "90%",
  },
  topCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: 5,
    position: "absolute",
    top: 70,
    justifyContent: "center",
    height: 70,
    width: "80%",
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowRadius: 2,
    marginHorizontal: 4,
    marginVertical: 6,
    marginBottom: 3,
    backgroundColor: "#fff",
  },
  editForm: {
    flex: 5,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  linearGradient: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 0,
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
  dropdownButtonTextStyle:{
    flex:1,
    justifyContent:'flex-start',
    alignItems:'flex-start'
  },
  dropdownButtonStyle:{
    width:'90%',
    height:40,
    borderRadius:5,
    padding:10,
    margin:10,
    borderColor:"thistle",
    borderRadius:5,marginTop:5
  },
  picker:{
  },
  pickerItemStyle:{
  },
  pickerWrapper:{
    borderWidth:1,
    margin:10,
    padding:10,
    borderRadius:5,
    width:'90%',
    height:40,
    borderColor:'thistle',
    justifyContent:'center',

  },
  headerWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 30,
  },
});

export default AddEditFarmerScreen;
