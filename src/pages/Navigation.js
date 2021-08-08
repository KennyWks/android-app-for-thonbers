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
import HeaderTitle from '../components/HeaderTitle';
import BackNavigation from '../components/BackNavigation';

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
          <Stack.Screen
            name="Profil"
            component={ProfilScreen}
            options={({navigation, route}) => ({
              headerLeft: (props) => (
                <BackNavigation page="Home" navigation={navigation} />
              ),
            })}
          />
          <Stack.Screen name="Ubah Profil" component={UpdateProfilScreen} />
          <Stack.Screen
            name="Ubah Password"
            component={UpdatePasswordAccountScreen}
          />
          <Stack.Screen
            name="Pelanggan"
            component={Customer}
            options={({navigation, route}) => ({
              headerTitle: (props) => (
                <HeaderTitle name="Pelanggan" {...props} />
              ),
              headerLeft: (props) => (
                <BackNavigation page="Home" navigation={navigation} />
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default Navigation;
