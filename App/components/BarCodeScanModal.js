import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button,Modal,TouchableOpacity } from "react-native";
import colors from "../config/colors";
import { Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BarCodeScanModal = (props) => {
    const {t } = useTranslation()

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [text, setText] = useState(t("Not yet scanned"));
  
    const askForCameraPermission = () => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status == "granted");
      })();
    };
  
    useEffect(() => {
      askForCameraPermission();
    }, []);

    const {isModalVisible, userIdChanged, setisModalVisible} = props

    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      setText(data);
      userIdChanged(data)
      setisModalVisible(false)
    };
  
    // if (hasPermission == null) {
    //   return (
    //     <View style={styles.container}>
    //       <Text>Requesting for camera permission</Text>
    //     </View>
    //   );
    // }
  
    if (hasPermission === false) {
      return (
        <View style={styles.container}>
          <Text>{t("No access to camera")}</Text>
          <Button title={t("Allow Camera")} onPress={() => askForCameraPermission} />
        </View>
      );
    }
    
  return (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setisModalVisible(false);
      }}
      style={styles.modalView}
    >
      <LinearGradient
        start={{ x: 0.1, y: 0.2 }}
        colors={[colors.primary, colors.primary]}
        style={styles.linearGradient}
      >
      </LinearGradient>
      <View style={{ flex: 7 }}>
        <View style={styles.container}>
          <View style={styles.barcodeBox}>
            <Camera
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              ratio="16:9"
              style={StyleSheet.absoluteFillObject}
            />
          </View>
          <Text style={styles.maintext}>{text}</Text>
          {scanned && (
            <Button
              title={("Scan again?")}
              onPress={() => setScanned(false)}
              color="tomato"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    barcodeBox: {
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      height: "80%",
      width: "90%",
      overflow: "hidden",
      borderRadius: 30,
      borderWidth: 0,
    },
    maintext: {
      fontSize: 16,
      margin: 20,
    },
  });
  