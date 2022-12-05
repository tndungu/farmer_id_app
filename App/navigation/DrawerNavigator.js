// import {createDrawerNavigator } from '@react-navigation/drawer'
// import { CustomDrawer } from '../components/CustomDrawer';
// import Ionicons from 'react-native-vector-icons/Ionicons'
// import TabNavigator from './TabNavigator';
// import { SettingStackNavigator } from './StackNavigator';
// import LoginScreen from '../screens/LoginScreen';

// const Drawer = createDrawerNavigator();

// const homeName = 'Home'
// const loginName = 'Login'
// const settingsName = 'Settings'
// const newCardName ='NewCard'

// export function DrawerNavigator(){

//     return (
//       <Drawer.Navigator
//         screenOptions={{
//           headerShown: false,
//           drawerActiveBackgroundColor: "#aa18ea",
//           drawerActiveTintColor: "#fff",
//           drawerInactiveTintColor: "#333",
//           drawerLabelStyle: {
//             marginLeft: -10,
//             fontSize: 15,
//           },
//         }}
//         initialRouteName={loginName}
//         drawerContent={(props) => <CustomDrawer {...props} />}
//         drawer
//       >
//         <Drawer.Screen name="Login" component={LoginScreen} />
//         <Drawer.Screen name="Home" component={TabNavigator} />
//         <Drawer.Screen
//           name="Settings"
//           component={SettingStackNavigator}
//           options={{
            
//             drawerIcon: ({ color }) => (
//               <Ionicons name="settings-outline" size={22} color={color} />
//             ),
//           }}
//         />
//       </Drawer.Navigator>
//     );
// }