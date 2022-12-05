import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';

const CustomMenu = (props) => {
  const [visible, setVisible] = useState(false);
  const {t,i18n} = useTranslation()

  return (
    <View
      style={{ height: "100%", alignItems: "center", justifyContent: "center" }}
    >
      <Menu
        visible={visible}
        onRequestClose={() => setVisible(false)}
        anchor={
          props.isIcon ? (
            <TouchableOpacity
              onPress={() => {
                setVisible(true);
              }}
              color="#fff"
            >
              <Ionicons
                name="ellipsis-vertical"
                style={{ padding: 10, fontSize: 22, color: "#fff" }}
              />
            </TouchableOpacity>
          ) : (
            <Text onPress={() => setVisible(true)} style={props.textStyle}>
              {props.menutext}
            </Text>
          )
        }
      >
        <MenuDivider />
        <MenuItem
          onPress={async () => {
            setVisible(false)
            await AsyncStorage.removeItem('LoggedIn');
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('refresh')
            props.navigation.navigate("Login");
          }}
        >
          {t("Logout")}
        </MenuItem>
      </Menu>
    </View>
  );
};

export default CustomMenu;

