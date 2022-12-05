import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { MainStackNavigator } from "./App/navigation/StackNavigator";
import { navigationRef } from "./App/navigation/RootNavigation";
import i18next from "./App/_languages/i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { backgroundTasks } from "./App/_services/farmer.service";
import { useLanguage } from "./App/hooks/useLanguage";
import { cleanUp } from "./App/hooks/cleanUp";

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const getLanguage = async () => {
      await cleanUp();
      await backgroundTasks();
      const { language } = await useLanguage();
      i18n.changeLanguage(language);
    };
    getLanguage();

    
  }, []);

  return (
    <I18nextProvider i18n={i18next}>
      <NavigationContainer ref={navigationRef}>
        <MainStackNavigator />
      </NavigationContainer>
    </I18nextProvider>
  );
}
