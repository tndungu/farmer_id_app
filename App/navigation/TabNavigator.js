import React, { useState, useEffect } from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import Colors from "../config/colors";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";
import { getInitialRouteName } from "../_services/sync.service";
import { Pressable } from "react-native";

const Tab = createBottomTabNavigator();

const DisabledTabBarButton = ({ style, ...props }) => (
  <Pressable style={[ style]} {...props} />
)

export const TabNavigator = (props) => {
  const [initialRoute, setInitialRoute] = useState(null);
  
  const { t } = useTranslation();

  useEffect(() => {
    (async() =>{
      const route = await getInitialRouteName();
      setInitialRoute(route);
  
      console.log("ïnitial context in TabNavigator is: ",initialRoute);
    
    })()
  }, []);

  const homeName = t("Home");
  const settingsName = t("Settings");
  
  if (initialRoute === null) {
    return <AppLoading />;
  } else {
    return (
        <Tab.Navigator
          initialRouteName={initialRoute}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: Colors.black,
            tabBarActiveBackgroundColor: Colors.primary,
            tabBarInactiveTintColor: "grey",
            tabBarLabelStyle: { paddingBottom: 10, fontSize: 12 },
            tabBarStyle: { height: 70 },
          })}
        >
          <Tab.Screen
            name={homeName}
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Ionicons name="home-outline" size={22} color={color} />
              ),
              tabBarButton: DisabledTabBarButton,
              unmountOnBlur:true
            }}
            // listeners={{
            //   tabPress: (e) => {
            //     if (initialRoute == "Settings") e.preventDefault();
            //   },
            // }}
          />
          <Tab.Screen
            name={settingsName}
            component={SettingsScreen}
            options={{
              fontSize: 22,
              tabBarIcon: ({ color }) => (
                <Ionicons name="settings-outline" size={22} color={color} />
              ),
              unmountOnBlur:true
            }}
          />
        </Tab.Navigator>
    );
  }
};

export default TabNavigator;
