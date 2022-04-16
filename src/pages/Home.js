import React, {Component} from 'react';
import {StyleSheet, View, Alert, BackHandler} from 'react-native';
import {connect} from 'react-redux';
import ActionType from '../redux/reducer/globalActionType';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Penjualan from './Penjualan';
import Kunjungan from './Kunjungan';
import Pembelian from './Pembelian';
import SQLite from 'react-native-sqlite-storage';

// SQLite.DEBUG(false);
// SQLite.enablePromise(false);

const Tab = createBottomTabNavigator();

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: props.isLogin,
      exp: props.exp,
      iat: props.iat,
    };
  }

  componentDidMount() {
    const time = Math.floor(new Date().getTime() / 1000);
    const session = this.state.exp - this.state.iat;
    if (time - this.state.iat > session) {
      this.handleLogout();
    }
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

  handleBackButtonClick = () => {
    if (this.state.isLogin) {
      BackHandler.exitApp();
      return true;
    }
  };

  handleLogout = () => {
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
      const query =
        'CREATE TABLE IF NOT EXISTS tbl_customer(id INTEGER PRIMARY KEY AUTOINCREMENT, nama VARCHAR(50), tempat_lahir VARCHAR(50), tgl_lahir VARCHAR(10), no_hp VARCHAR(12), email VARCHAR(20), agama VARCHAR(20), jk VARCHAR(9), alamat VARCHAR(100), fotoName VARCHAR(255), fotoUri VARCHAR(255), latitude VARCHAR(255), longitude VARCHAR(255), submited INT(1), created_by INT(1))';
      await this.executeQuery(query);
    } catch (error) {
      Alert.alert('Database error!');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <ViewTab />
      </View>
    );
  }
}

const ViewTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="Kunjungan"
      tabBarOptions={{
        activeTintColor: '#fff',
        inactiveTintColor: 'lightgray',
        style: {
          backgroundColor: '#466BD9',
          paddingBottom: 5,
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
      <Tab.Screen
        name="Pembelian"
        component={Pembelian}
        options={{
          tabBarLabel: 'Menu Pembelian',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="cash-multiple"
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
});
