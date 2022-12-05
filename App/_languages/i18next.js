import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import english from './english.json'
import nyanja from './nyanja.json'
import portuguese from './portuguese.json'
import swahili from './swahili.json'

i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng:'en',
    resources:{
        en:english,
        ny:nyanja,
        pt:portuguese,
        sw:swahili
    },
    react:{
        useSuspense:false
    },
})

export default i18next