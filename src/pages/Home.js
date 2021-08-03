import React, {Component} from 'react';
import {StyleSheet, View, Text, Alert, BackHandler} from 'react-native';
import {connect} from 'react-redux';
import ActionType from '../redux/reducer/globalActionType';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Penjualan from './Penjualan';
import Kunjungan from './Kunjungan';
import SQLite from 'react-native-sqlite-storage';
// SQLite.DEBUG(false);
// SQLite.enablePromise(false);

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: props.isLogin,
      data: {
        id_user: props.data.id_user,
        email: props.data.email,
        role_id: props.data.role_id,
      },
      exp: props.exp,
      iat: props.iat,
    };
  }

  componentDidMount() {
    this.handleDatabase();
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  componentDidUpdate() {
    const time = Math.floor(new Date().getTime() / 1000);
    const session = this.state.exp - this.state.iat;
    if (time - this.state.iat > session) {
      this.handleLogout();
    }
  }

  handleBackButtonClick = () => {
    if (this.state.isLogin) {
      BackHandler.exitApp();
      return true;
    }
  };

  handleLogout = () => {
    this.hideMenu();
    this.props.handleLogout();
    setTimeout(() => {
      this.props.navigation.navigate('Login');
    }, Alert.alert('Sesi anda telah berakhir, silahkan login kembali'));
  };

  executeQuery = (sql, params = []) =>
    new Promise((resolve, reject) => {
      SQLite.openDatabase(
        {name: 'thonbers_db.db', createFromLocation: 1},
        (db) => {
          db.transaction((trx) => {
            trx.executeSql(
              sql,
              params,
              (trx, results) => {
                resolve(results);
              },
              (error) => {
                reject(error);
              },
            );
          });
        },
      );
    });

  handleDatabase = async () => {
    try {
      let query =
        'CREATE TABLE IF NOT EXISTS tbl_customer(id INTEGER PRIMARY KEY AUTOINCREMENT, nama VARCHAR(50), tempat_lahir VARCHAR(50), tgl_lahir VARCHAR(10), no_hp VARCHAR(12), email VARCHAR(20), agama VARCHAR(20), jk VARCHAR(9), alamat VARCHAR(100), fotoName VARCHAR(255), fotoUri VARCHAR(255), latitude VARCHAR(255), longitude VARCHAR(255), submited INT(1), created_by INT(1))';
      await this.executeQuery(query);
    } catch (error) {
      Alert.alert('Database error!');
    }
  };

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

  handleRedirectToProfil = () => {
    this.hideMenu();
    this.props.navigation.push('Profil');
  };

  handleRedirectToDataKunjunganOffline = () => {
    this.hideMenu();
    this.props.navigation.push('Pelanggan');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.appBar}>
          <Menu
            ref={this.setMenuRef}
            button={
              <Text onPress={this.showMenu}>
                <MaterialCommunityIcons name="dots-vertical" size={25} />
              </Text>
            }>
            <MenuItem onPress={this.handleRedirectToDataKunjunganOffline}>
              Pelanggan - Offline
            </MenuItem>
            <MenuItem onPress={this.handleRedirectToProfil}>
              Profil saya
            </MenuItem>
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
        activeTintColor: '#fff',
        inactiveTintColor: 'lightgray',
        style: {
          backgroundColor: '#466BD9',
        },
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
    data: {
      id_user: state.data.id_user,
      email: state.data.email,
      role_id: state.data.role_id,
    },
    exp: state.exp,
    iat: state.iat,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogout: () => dispatch({type: ActionType.IS_LOGOUT}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  appBar: {
    backgroundColor: '#fff',
    height: '11%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'lightgrey',
  },
  bottomTab: {
    height: '10%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
