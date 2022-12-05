import AsyncStorage from "@react-native-async-storage/async-storage"

const setUserLanguage = (lang) => {
    AsyncStorage.setItem('selectedLanguage',lang)
}

export const useLanguage = async () => {
    const lang = await AsyncStorage.getItem('selectedLanguage')
    const res = {language:lang,setLanguage:setUserLanguage}
    return res
}