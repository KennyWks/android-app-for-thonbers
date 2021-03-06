import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// export const ApiURL = 'http://10.0.2.2:81/BetaBajual.com/public';
export const ApiURL = 'https://thonbers.000webhostapp.com';

const header = {
  Accept: 'application/json',
  'Content-Type': 'multipart/form-data',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};
let token = {};

export const postData = async (path, data) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (accessToken) {
    token = {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
  } else {
    token = {};
  }

  try {
    const response = await axios.post(ApiURL + path, data, token, header);
    return response;
  } catch (error) {
    throw error;
  }
};

export const patchData = async (path, data) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (accessToken) {
    token = {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
  } else {
    token = {};
  }

  try {
    const response = await axios.patch(ApiURL + path, data, token, header);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getData = async (path) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (accessToken) {
    token = {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
  } else {
    token = {};
  }

  try {
    const response = await axios.get(ApiURL + path, token);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteData = async (path) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  if (accessToken) {
    token = {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
  } else {
    token = {};
  }

  try {
    const response = await axios.delete(ApiURL + path, token);
    return response;
  } catch (error) {
    throw error;
  }
};
