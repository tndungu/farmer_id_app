// import { createStore, combineReducers, applyMiddleware, compose } from "redux";
// import thunk from "redux-thunk";
// import userReducer from "../_reducers/user.reducer";
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { composeWithDevTools } from 'redux-devtools-extension'
// import { persistReducer, persistStore } from "redux-persist";
// import rootReducer from '../_reducers'


// const persistConfig = {
//     key:'root',
//     storage:AsyncStorage
// }

// const persistedReducer = persistReducer(persistConfig,rootReducer)

// export default  () => {
//     let Store = createStore(persistedReducer,composeWithDevTools(applyMiddleware(thunk))) //, composeWithDevTools(applyMiddleware(thunk))
//     let persistor = persistStore(Store)
//     return {Store, persistor}
// }


//export const Store = createStore(rootReducer,applyMiddleware(thunk))