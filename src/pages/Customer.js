import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SQLite from 'react-native-sqlite-storage';
import Spinner from '../components/SpinnerScreen';
import {postData} from '../helpers/CRUD';
import {toastMessage} from '../components/Toast';
import RNPickerSelect from 'react-native-picker-select';
import {connect} from 'react-redux';
import ActionType from '../redux/reducer/globalActionType';
import {useSelector, useDispatch} from 'react-redux';

const Customer = ({navigation}) => {
  const menu = useRef();

  let [flatListItems, setFlatListItems] = useState([]);
  let [onLoad, setOnLoad] = useState(false);

  const exp = useSelector((state) => state.exp);
  const iat = useSelector((state) => state.iat);
  const dispatch = useDispatch();

  useEffect(() => {
    checkSession();
    getCustomers('SELECT * FROM tbl_customer');
  }, []);

  const hideMenu = () => {
    menu.current.hide();
  };

  const showMenu = () => {
    menu.current.show();
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          ref={menu}
          button={
            <Text onPress={showMenu}>
              <MaterialCommunityIcons name="dots-vertical" size={25} />
            </Text>
          }>
          <MenuItem onPress={handleSyncData}>Sinkron Data</MenuItem>
          <MenuDivider />
          <MenuItem onPress={handleEmptyData}>Kosongkan Data</MenuItem>
        </Menu>
      ),
    });
  }, [navigation]);

  const checkSession = () => {
    const time = Math.floor(new Date().getTime() / 1000);
    const session = exp - iat;
    if (time - iat > session) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    dispatch({type: ActionType.IS_LOGOUT});
    setTimeout(() => {
      navigation.navigate('Login');
    }, Alert.alert('Sesi anda telah berakhir, silahkan login kembali'));
  };

  async function getCustomers(query) {
    let temp = [];
    try {
      const results = await executeQuery(query);
      for (let i = 0; i < results.rows.length; ++i) {
        temp.push(results.rows.item(i));
      }
      setFlatListItems(temp);
    } catch (error) {
      Alert.alert('Something error!');
    }
    return temp;
  }

  const executeQuery = (sql, params = []) =>
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

  let listViewItemSeparator = () => {
    return <View style={styles.listViewItemSeparator} />;
  };

  let listItemView = (item) => {
    let status;
    if (item.submited === 0) {
      status = 'Belum Disinkron';
    } else if (item.submited === 1) {
      status = 'Berhasil Disinkron';
    } else {
      status = 'Gagal Disinkron';
    }
    return (
      <View key={item.id} style={styles.listView}>
        <Image
          source={{
            uri: item.fotoUri,
          }}
          style={styles.listItemImage}
        />
        <View>
          <Text>{item.nama}</Text>
          <Text>{item.no_hp}</Text>
          <Text>{item.email}</Text>
          <Text>Status : {status}</Text>
        </View>
      </View>
    );
  };

  const handleEmptyData = async () => {
    hideMenu();
    setOnLoad(true);
    const data = await getCustomers('SELECT * FROM tbl_customer');
    if (data.length > 0) {
      try {
        await executeQuery('DELETE FROM tbl_customer');
        toastMessage('Berhasil mengkosongkan data');
        getCustomers('SELECT * FROM tbl_customer');
      } catch (error) {
        toastMessage('Gagal mengkosongkan data');
      }
    } else {
      Alert.alert('Data pelanggan kosong');
    }
    setOnLoad(false);
  };

  const updateSubmitedCustomer = async (id, status) => {
    try {
      await executeQuery('UPDATE tbl_customer set submited=? where id=?', [
        status,
        id,
      ]);
    } catch (error) {
      toastMessage('Gagal mengubah status sinkron');
    }
  };

  const handleSyncData = async () => {
    hideMenu();
    setOnLoad(true);

    const data = await getCustomers('SELECT * FROM tbl_customer');
    if (data.length > 0) {
      let formData = new FormData();
      for (let i = 0; i < data.length; i++) {
        if (data[i].submited !== 0) {
          continue;
        }
        formData.append('latitude', data[i].latitude);
        formData.append('longitude', data[i].longitude);
        formData.append('no_hp', data[i].no_hp);
        formData.append('nama', data[i].nama);
        formData.append('tempat_lahir', data[i].tempat_lahir);
        formData.append('tgl_lahir', data[i].tgl_lahir);
        formData.append('agama', data[i].agama);
        formData.append('jk', data[i].jk);
        formData.append('email', data[i].email);
        formData.append('alamat', data[i].alamat);
        formData.append('created_by', data[i].created_by);
        formData.append('foto', {
          uri: data[i].fotoUri,
          type: 'image/jpg',
          name: data[i].fotoName,
        });
        try {
          await postData('/user_m/kunjungan/sinkron/customer', formData);
          updateSubmitedCustomer(data[i].id, 1);
        } catch (error) {
          if (error.response.status !== 404) {
            updateSubmitedCustomer(data[i].id, 2);
          } else {
            Alert.alert('Something error!');
          }
        }
      }
      toastMessage('Data telah diperbaharui');
      getCustomers('SELECT * FROM tbl_customer');
    } else {
      Alert.alert('Data pelanggan kosong');
    }

    setOnLoad(false);
  };

  return (
    <SafeAreaView style={styles.viewArea}>
      <Spinner visible={onLoad} textContent="Memproses..." />
      <View style={styles.view}>
        <View style={styles.pickerStatus}>
          <RNPickerSelect
            onValueChange={(value) => {
              if (value === '') {
                getCustomers('SELECT * FROM tbl_customer');
              } else {
                getCustomers(
                  `SELECT * FROM tbl_customer WHERE submited = ${value}`,
                );
              }
            }}
            placeholder={{
              label: 'Pilih Status Sinkron',
              value: '',
              color: 'red',
            }}
            items={[
              {label: 'Belum Disinkron', value: '0'},
              {label: 'Berhasil Disinkron', value: '1'},
              {label: 'Gagal Disinkron', value: '2'},
            ]}
          />
        </View>
        <View style={styles.viewArea}>
          {!onLoad && flatListItems.length > 0 && (
            <FlatList
              data={flatListItems}
              ItemSeparatorComponent={listViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => listItemView(item)}
            />
          )}
          {!onLoad && !flatListItems.length > 0 && (
            <View style={styles.viewEmptyData}>
              <Text>Data Pelanggan Kosong.</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default connect()(Customer);

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: 'white',
  },
  viewArea: {
    flex: 1,
  },
  viewEmptyData: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  listView: {
    backgroundColor: 'white',
    padding: 10,
    borderColor: '#E3E6F0',
    borderWidth: 5,
  },
  listViewItemSeparator: {
    height: 0.2,
    width: '100%',
    backgroundColor: '#808080',
  },
  listItemImage: {
    height: 130,
    resizeMode: 'stretch',
    margin: 3,
    borderColor: '#E3E6F0',
    borderWidth: 3,
  },
  pickerStatus: {
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
  },
});
