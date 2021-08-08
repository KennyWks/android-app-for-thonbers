import ActionType from './globalActionType';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

let globalState = {
  isConnected: false,
  isLogin: false,
  data: {
    id_user: null,
    email: null,
    role_id: null,
  },
  exp: 0,
  iat: 0,
};

// Reducer
const rootReducer = (state = globalState, action) => {
  if (action.type === ActionType.IS_LOGIN) {
    setIsLogin();
  }

  if (action.type === ActionType.IS_LOGOUT) {
    setIsLogout();
  }

  if (action.type === ActionType.IS_CONNECTED) {
    setConnectionStatus();
  }

  return state;
};

const setIsLogin = async () => {
  try {
    const asyncStorage = await AsyncStorage.getItem('accessToken');
    const token = jwtDecode(asyncStorage);
    globalState.isLogin = true;
    globalState.data.id_user = token.data.id;
    globalState.data.email = token.data.email;
    globalState.data.role_id = token.data.role_id;
    globalState.exp = token.exp;
    globalState.iat = token.iat;
  } catch (error) {
    // console.log(error);
  }
};

const setIsLogout = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
    globalState.isLogin = false;
    globalState.data.id_user = null;
    globalState.data.email = null;
    globalState.data.role_id = null;
    globalState.exp = 0;
    globalState.iat = 0;
  } catch (error) {
    // console.log(error);
  }
};

const setConnectionStatus = NetInfo.addEventListener((state) => {
  globalState.isConnected = state.isConnected;
});

export default rootReducer;
