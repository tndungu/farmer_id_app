import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text, TextInput, StyleSheet, TouchableOpacity, Image, Switch, Keyboard, ActivityIndicator, BackHandler, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import { TouchableHighlight } from "react-native-gesture-handler";
import { Formik } from "formik";
import * as Yup from "yup";
import CryptoES from "crypto-es";
import { passPhrase } from "../config/passPhrase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarCodeScanModal } from "../components/BarCodeScanModal";
import { useTranslation } from "react-i18next";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { config } from "../api/config";

const LoginScreen = ({ navigation }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  const [isModalVisible, setisModalVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [invalidLogin, setInvalidLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    userId: "",
    password: "",
  });

  const route = useRoute();
  const { t } = useTranslation();

  async function loginUser(user) {
    setIsLoading(true);
    const userItems = AsyncStorage.getItem("user");

    const usrObject = await userItems;

    console.log("usrObject[0]?.userId ",JSON.parse(usrObject)[0]?.userId);
    console.log("usrObject[0]?.password ",JSON.parse(usrObject)[0]?.password);

    if(JSON.parse(usrObject)[0]?.userId != null && JSON.parse(usrObject)[0]?.password != null){
      navigation.navigate("Dashboard");
    }
      
    if (userItems !== null) {
      userItems.then(async (users) => {
        const jsonUsers = JSON.parse(users);
        let usr = null;
        if (jsonUsers !== null)
          usr = jsonUsers.find((x) => x.userId == user.userId);
        //const tokenExists = await AsyncStorage.getItem("token");

        if (usr) {
          setIsLoading(false);
          if (user && user.password === DecryptPassword(usr?.password)) {
            setLoggedIn(true);
            await AsyncStorage.setItem("LoggedIn", user.userId);
            await AsyncStorage.setItem("LoggedInPassword", user.password);
            navigation.navigate("Dashboard");
          } else {
            setInvalidLogin(true);
            setLoggedIn(false);
          }
        } else {
          axios
            .post(`${config.jwtUrl}create/`, {
              staff_id: user.userId,
              password: user.password,
            })
            .then(async (res) => {
              setIsLoading(false);
              if (res?.status == 200) {
                setLoggedIn(true);
                await AsyncStorage.setItem("token", res.data.access);
                await AsyncStorage.setItem("refresh", res.data.refresh);
                await addOrUpdateLocalUser(user);
                await AsyncStorage.setItem("LoggedIn", user.userId);
                await AsyncStorage.setItem("LoggedInPassword", user.password);
                navigation.navigate("Dashboard");
              } else {
                setInvalidLogin(true);
                setLoggedIn(false);
              }
            })
            .catch((error) => {
              //if (error.response.status === 401) 
              setInvalidLogin(true);
              setIsLoading(false);
            });
        }
      });
    }
    //setIsLoading(false);
  }

  const userIdChanged = (userId) => {
    setUserData((prev) => ({ ...prev, userId: userId }));
  };

  async function addOrUpdateLocalUser(user) {
    var encrypted = EncryptPassword(user.password);
    let users = JSON.parse(await AsyncStorage.getItem("user"));
    if (users == null) users = [];
    const usrObject = {
      userId: user.userId,
      password: encrypted,
    };
    if (users.length > 0) {
      const index = users.findIndex((x) => x.userId === user.userId);
      if (index === -1) users.push(usrObject);
      else users[index] = usrObject;
    } else {
      users.push(usrObject);
    }
    await AsyncStorage.setItem("user", JSON.stringify(users));
  }

  const validationSchema = Yup.object().shape({
    userId: Yup.string().required(`${t("user id")} ${t("is required")}`),
    password: Yup.string().required(`${t("Password")} ${t("is required")}`),
  });

  useEffect(() => {
    const initializeUsers = async () => {
      setInvalidLogin(false);

      const usersCleanUp = await AsyncStorage.getItem("usersCleanUp");
      if (usersCleanUp == null) {
        AsyncStorage.getItem("user").then((res) => {
          if (res) AsyncStorage.removeItem("user");
        });

        await AsyncStorage.setItem("user", JSON.stringify([]));
        await AsyncStorage.setItem("usersCleanUp", "Updated");
      }
    };
    initializeUsers();

    const backAction = () => {
      if (route.name === "Login") {
        Alert.alert("Exit!", "Are you sure you want to exit App?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const toggleSwitch = () => {
    setIsEnabled((isEnabled) => !isEnabled);

    if (!isEnabled) {
      setisModalVisible(true);
    }
  };

  const EncryptPassword = (pass) => {
    const encrypted = CryptoES.AES.encrypt(pass, passPhrase).toString();
    return encrypted;
  };

  const DecryptPassword = (pass) => {
    var C = require("crypto-js");
    const password = C.AES.decrypt(pass, passPhrase);
    return password.toString(C.enc.Utf8);
  };

  const handleSubmit = async (e) => {
    await loginUser({ userId: e.userId, password: e.password });
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        colors={["#e2c461", "#f5f29f"]}
        style={styles.linearGradient}
      >
        <View style={styles.logo}>
          <TouchableHighlight
            style={[
              styles.profileImgContainer,
              {
                borderColor: "transparent",
                borderWidth: 1,
                backgroundColor: "#f5f29f",
              },
            ]}
          >
            <Image
              style={styles.logoImage}
              source={require("../assets/Hakiki-removebg.png")}
            />
          </TouchableHighlight>
        </View>
        <Formik
          initialValues={userData}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSubmit(values)}
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
            <View style={styles.loginUser}>
              <Text style={styles.userIdStyle}>{t("User Id")}</Text>
              <TextInput
                style={styles.userInput}
                underlineColorAndroid="transparent"
                placeholder={t("User Id")}
                value={values.userId}
                onSubmitEditing={Keyboard.dismiss}
                editable={!isEnabled}
                onChangeText={(event) => {
                  setFieldValue("userId", event);
                  setUserData((prev) => ({ ...prev, userId: event }));
                }}
                onBlur={handleBlur("userId")}
                maxLength={50}
              />
              {errors.userId && (
                <Text style={styles.error}>{errors.userId}</Text>
              )}
              <View style={styles.enableScan}>
                <Text
                  style={{
                    margin: 5,
                    fontSize: 18,
                  }}
                >
                  {t("Scan")}
                </Text>

                <Switch
                  trackColor={{ false: "#767577", true: "#767577" }}
                  thumbColor={isEnabled ? "#1dbf58" : "#f4f3f4"}
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
              </View>
              <TextInput
                style={styles.userInput}
                underlineColorAndroid="transparent"
                placeholder={t("Password")}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                maxLength={50}
                secureTextEntry
              />
              {errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={(e) => {
                  Keyboard.dismiss();
                  handleSubmit(e);
                }}
                disabled={!isValid}
              >
                {!isLoading && (
                  <Text style={styles.loginText}>{t("login")}</Text>
                )}
                {isLoading && (
                  <ActivityIndicator
                    animating={true}
                    size="large"
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
              {invalidLogin && (
                <Text style={styles.error}>
                  {t("invalid login credentials")}
                </Text>
              )}
            </View>
          )}
        </Formik>
        <BarCodeScanModal
          userIdChanged={userIdChanged}
          isModalVisible={isModalVisible}
          setisModalVisible={setisModalVisible}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: "#F2F2EE",
    flex: 1,
    alignItems: "center",
  },
  error: {
    color: "red",
    marginLeft: 10,
  },
  enableScan: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImgContainer: {
    marginLeft: 8,
    height: 150,
    width: 150,
    borderRadius: 80,
    overflow: "hidden",
  },
  logoImage: {
    flex: 1,
    resizeMode: "contain",
    height: 70,
    width: 150,
  },
  loginView: {},
  linearGradient: {
    flex: 1,
    width: "100%",
  },
  loginButton: {
    height: 40,
    backgroundColor: colors.primary,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  logo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  userInput: {
    height: 40,
    justifyContent: "flex-end",
    margin: 5,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    width: "100%",
    borderColor: colors.black,
  },
  userIdStyle: {
    fontWeight: "600",
    fontSize: 18,
    margin: 10,
    color: "#000",
  },
  loginText: {
    fontWeight: "600",
    fontSize: 18,
    color: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loginUser: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "80%",
    marginLeft: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "600",
  },
});

export default LoginScreen;
