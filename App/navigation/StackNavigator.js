import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";
import colors from "../config/colors";
import CustomMenu from "../shared/CustomMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import AppLoading from 'expo-app-loading'

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  const { t, i18n } = useTranslation();
  const [initialRoute, setInitialRoute] = useState(null);

  const getInitialRouteName =async () => {
    return new Promise(async (resolve,reject) => {
      const usr = await AsyncStorage.getItem("LoggedIn");
      
      const route = usr !== null ? "Dashboard" : "Login"
      setInitialRoute(route);
      resolve(route)
    })
  };

  useEffect(() => {
    (async () => {
      await getInitialRouteName()
    })();
  }, []);

if (initialRoute === null) {
  return <AppLoading />;
} else {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route, navigation }) => ({
        headerRight: () => (
          <CustomMenu
            menutext="Menu"
            menuStyle={{ marginRight: 14 }}
            textStyle={{ color: "#fff" }}
            navigation={navigation}
            route={route}
            isIcon={true}
          />
        ),
        headerStyle: {
          backgroundColor: colors.primary,
        },

        headerTintColor: "white",
        headerBackTitle: "Black",
        headerShown: true,
      })}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          gestureEnabled: false,
          headerLeft: () => <></>,
          headerBackVisible: false,
        }}
      /> */}
      <Stack.Screen
        name="Dashboard"
        component={TabNavigator}
        options={{
          title: `${t("Home")}`,
          height: 20,

          gestureEnabled: false,
          headerLeft: () => <></>,
        }}
      />
    
    </Stack.Navigator>
  );
}
  
};

export { MainStackNavigator };
