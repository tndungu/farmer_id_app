// import { userConstants } from "../_constants";
// import { userService } from "../../_services";
// import * as RootNavigation from '../../navigation/RootNavigation'

// const login = (user) => (dispatch) => {
//   console.log("DISPATCH ON LOGIN",user);
  
//   const localUser = user
//   dispatch({
//     type: userConstants.LOGIN_REQUEST,
//     payload:user
//   })
 
//   RootNavigation.navigate('Dashboard')

//   const usr = userService.userExistsLocal(user)

//     console.log("user in dispatch",usr);
     
//     console.log("user failed dispatch",user);
//     userService.login(user)
//     .then(response => {
//       return response.json()
//     })
//     .then(
//       user => {
//         if(user){
//           userService.addOrUpdateLocalUser(localUser.userId,localUser.Password)
//           dispatch(userConstants.LOGIN_SUCCESS,user)
//           RootNavigation.navigate('Dashboard')
//         }else{
//           dispatch(userConstants.LOGIN_FAILURE,user)
//         }
//       }
//     )
// }

// const setLoggedInUser = (user) => (dispatch) => {
//   dispatch({
//     type: userConstants.SET_LOGGEDIN_USER,
//     payload: user
//   })

// }

// export {login}