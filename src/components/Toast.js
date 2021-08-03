import {ToastAndroid} from 'react-native';

export const toastMessage = (message) => {
  ToastAndroid.showWithGravity(
    message,
    ToastAndroid.SHORT,
    ToastAndroid.BOTTOM,
  );
};
