import ActionType from './globalActionType';

const globalState = {
  isLogin: false,
};

// Reducer
const rootReducer = (state = globalState, action) => {
  if (action.type === ActionType.IS_LOGIN) {
    return {
      ...state,
      isLogin: true,
    };
  }
  if (action.type === ActionType.IS_LOGOUT) {
    return {
      ...state,
      isLogin: false,
    };
  }
  return state;
};

export default rootReducer;
