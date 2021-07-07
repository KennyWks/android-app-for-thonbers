import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import LoginScreen from './Login';
import HomeScreen from './Home';
import ProfilScreen from './Profil';
import UpdateProfilScreen from './UpdateProfil';
import UpdatePasswordAccountScreen from './UpdatePasswordAccount';
import Customer from './Customer';

const Stack = createStackNavigator();

class Navigation extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen name="Profil" component={ProfilScreen} />
          <Stack.Screen name="Update Profil" component={UpdateProfilScreen} />
          <Stack.Screen
            name="Update Password"
            component={UpdatePasswordAccountScreen}
          />
          <Stack.Screen name="Get All Customer" component={Customer} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default Navigation;
