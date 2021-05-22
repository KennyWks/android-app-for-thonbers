import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {connect} from 'react-redux';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActionType from '../redux/reducer/globalActionType';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Penjualan from './Penjualan';
import Kunjungan from './Kunjungan';

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: props.isLogin,
      data: {
        id_user: false,
        email: false,
        role_id: false,
      },
      exp: 0,
      iat: 0,
    };
  }

  componentDidMount() {
    this.getDataToken();
    setTimeout(() => {
      const time = Math.floor(new Date().getTime() / 1000);
      const session = this.state.exp - this.state.iat;
      if (time - this.state.iat > session) {
        this.handleLogout();
      }
    }, 150);
  }

  componentWillUnmount() {
    setTimeout(() => {
      const time = Math.floor(new Date().getTime() / 1000);
      const session = this.state.exp - this.state.iat;
      if (time - this.state.iat > session) {
        this.handleLogout();
      }
    }, 150);
  }

  _menu = null;

  setMenuRef = (ref) => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  getDataToken = async () => {
    const asyncStorage = await AsyncStorage.getItem('accessToken');
    const token = jwtDecode(asyncStorage);
    this.setState((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        id: token.data.id,
        email: token.data.email,
        role_id: token.data.role_id,
      },
      exp: token.exp,
      iat: token.iat,
    }));
  };

  redirectToProfil = () => {
    this.hideMenu();
    this.props.navigation.navigate('Profil');
  };

  handleLogout = async () => {
    this.hideMenu();
    await AsyncStorage.removeItem('accessToken');
    this.props.handleLogout();
    setTimeout(() => {
      this.props.navigation.navigate('Login');
    }, alert('Sesi anda telah berakhir, silahkan login kembali'));
  };

  render() {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={styles.appBar}>
          <Menu
            ref={this.setMenuRef}
            button={
              <Text onPress={this.showMenu}>
                <MaterialCommunityIcons name="dots-vertical" size={25} />
              </Text>
            }>
            <MenuItem onPress={this.redirectToProfil}>Profil saya</MenuItem>
            <MenuDivider />
            <MenuItem onPress={this.handleLogout}>Keluar</MenuItem>
          </Menu>
        </View>

        <BottomTab />
      </View>
    );
  }
}

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="Kunjungan"
      tabBarOptions={{
        activeTintColor: '#e91e63',
      }}>
      <Tab.Screen
        name="Kunjungan"
        component={Kunjungan}
        options={{
          tabBarLabel: 'Form Kunjungan',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="account-edit-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Penjualan"
        component={Penjualan}
        options={{
          tabBarLabel: 'Menu Penjualan',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="shopping-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const mapStateToProps = (state) => {
  return {
    isLogin: state.isLogin,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogout: () => dispatch({type: ActionType.IS_LOGOUT}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#fff',
    height: '8%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
  },
  bottomTab: {
    height: '10%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
