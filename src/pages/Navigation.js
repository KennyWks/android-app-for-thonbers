import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import LoginScreen from './Login';
import HomeScreen from './Home';
import ProfilScreen from './Profil';
import UpdateProfilScreen from './UpdateProfil';
import UpdatePasswordAccountScreen from './UpdatePasswordAccount';
import CreateNota from './CreateNota';
import Penjualan from './Penjualan';
import Pembelian from './Pembelian';
import UbahPembelian from './UbahPembelian';
import DetailPembelian from './DetailPembelian';
import Customer from './Customer';
import Header from '../components/MyHeader';
import BackNavigation from '../components/BackNavigation';
import PrintNotaPDF from './PrintNotaPDF';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Stack = createStackNavigator();

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: '#466BD9',
      color: '#ffffff',
    };
  }

  render() {
    const {backgroundColor, color} = this.state;
    return (
      <SafeAreaProvider>
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
                headerStyle: {
                  backgroundColor: backgroundColor,
                },
                headerTintColor: color,
              })}
            />
            <Stack.Screen
              name="Ubah Profil"
              component={UpdateProfilScreen}
              options={() => ({
                headerStyle: {
                  backgroundColor: backgroundColor,
                },
                headerTintColor: color,
              })}
            />
            <Stack.Screen
              name="Ubah Password"
              component={UpdatePasswordAccountScreen}
              options={() => ({
                headerStyle: {
                  backgroundColor: backgroundColor,
                },
                headerTintColor: color,
              })}
            />
            <Stack.Screen
              name="Pelanggan"
              component={Customer}
              options={({navigation, route}) => ({
                headerTitle: (props) => <Header name="Pelanggan" {...props} />,
                headerLeft: (props) => (
                  <BackNavigation page="Home" navigation={navigation} />
                ),
                headerStyle: {
                  backgroundColor: backgroundColor,
                },
                headerTintColor: color,
              })}
            />
            <Stack.Screen name="Buat Nota" component={CreateNota} />
            <Stack.Screen name="Print Nota PDF" component={PrintNotaPDF} />
            <Stack.Screen name="Ubah Pembelian" component={UbahPembelian} />
            <Stack.Screen
              name="Penjualan"
              component={Penjualan}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Pembelian"
              component={Pembelian}
              options={{headerShown: false}}
            />
            <Stack.Screen name="Detail Pembelian" component={DetailPembelian} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}

export default Navigation;
