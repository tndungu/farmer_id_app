// import { userConstants } from "../_constants/user.constants";

// const initialState = {
//     loginIn:false,
//     loggedIn:false,
//     user:{ userId: '', password:''}
// }

// function userReducer(state = initialState, action) {
//   switch (action.type) {
//     case userConstants.LOGIN_REQUEST:
//       return { ...state, loginIn:true };
//     case userConstants.LOGIN_SUCCESS:
//       return {...state, loggedIn:true,user:action.payload };
//     case userConstants.LOGIN_FAILURE:
//       return state
//     case userConstants.LOGOUT:
//       return state
//     default:
//       return state;
//   }
// }

// export default userReducer;