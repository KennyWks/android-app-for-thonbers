import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  Button,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Spinner from '../components/SpinnerScreen';
import {connect} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {postData} from '../helpers/CRUD';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import SQLite from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import ActionType from '../redux/reducer/globalActionType';
import {useSelector, useDispatch} from 'react-redux';
import {toastMessage} from '../components/Toast';
import {flexDirection} from 'styled-system';
import numeral from 'numeral';

const Penjualan = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const menu = useRef();

  let [data, setData] = useState([]);
  let [onLoad, setOnLoad] = useState(false);

  // const userData = useSelector((state) => state.data);
  const dispatch = useDispatch();

  useEffect(() => {
    getDataPembelian();
  }, []);

  const getDataPembelian = async () => {
    setOnLoad(true);
    try {
      const getDataOffline = await executeQuery(
        'SELECT * FROM tbl_purchase JOIN tbl_product ON tbl_product.id_product = tbl_purchase.id_product ORDER BY tbl_purchase.id DESC',
      );
      let dataOffline = [];
      for (let i = 0; i < getDataOffline.rows.length; ++i) {
        dataOffline.push(getDataOffline.rows.item(i));
      }
      setData(dataOffline);
    } catch (error) {
      if (error.response.status === 404) {
        const {msg} = error.response.data;
        Alert.alert(msg);
      } else {
        Alert.alert('Terjadi kesalahan!');
      }
    }
    setOnLoad(false);
  };

  const handleSyncPembelian = async () => {
    menu.current.hide();
    setOnLoad(true);
    let formData = {};
    for (let i = 0; i < data.length; i++) {
      if (data[i].submited === 0) {
        formData = {
          id_saler: data[i].id_saler,
          id_product: data[i].id_product,
          customer: data[i].customer,
          type: data[i].jenis,
          category: data[i].kategori,
          unit: data[i].satuan,
          priceOfSell: data[i].harga_jual,
          discount: data[i].disc,
          priceOfCourier: data[i].ongkos_kirim,
          total: data[i].qty_beli,
        };
        try {
          await postData('/user_m/saler/purchase/add', formData);
          await executeQuery('UPDATE tbl_purchase set submited=? where id=?', [
            1,
            data[i].id,
          ]);
        } catch (error) {
          toastMessage('Gagal mengsinkron data');
        }
      }
    }
    getDataPembelian();
    setOnLoad(false);
  };

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

  const handleEmptyData = async () => {
    menu.current.hide();
    setOnLoad(true);
    if (data.length > 0) {
      try {
        await executeQuery('DELETE FROM tbl_purchase');
        toastMessage('Berhasil mengkosongkan data');
        getDataPembelian();
      } catch (error) {
        toastMessage('Gagal mengkosongkan data');
      }
    } else {
      Alert.alert('Data pembelian kosong');
    }
    setOnLoad(false);
  };

  let listViewItemSeparator = () => {
    return <View style={styles.listViewItemSeparator} />;
  };

  let listItemView = (item) => {
    return (
      <View key={item.id} style={styles.listView}>
        <View>
          <Text>{item.nama}</Text>
          <Text>Pembeli (HP) : {item.customer}</Text>
          <Text>
            Status : {item.submited === 1 ? 'Disinkron' : 'Belum Disinkron'}
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <View>
              <Text>Qty Beli : {item.qty_beli}</Text>
              <Text>
                Total : IDR{' '}
                {numeral(item.sub_total2.toString()).format('0,0[.]00')}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <Button
                color="#169B6B"
                title="Detail"
                style={styles.button}
                onPress={() => {
                  navigation.navigate('Detail Pembelian', {id: item.id});
                }}
              />
              <Button
                color="#BB2D3B"
                title="Hapus"
                style={styles.button}
                onPress={async () => {
                  try {
                    await executeQuery('DELETE FROM  tbl_purchase where id=?', [
                      item.id,
                    ]);
                    getDataPembelian();
                  } catch (error) {
                    Alert.alert('Pembelian gagal dihapus!');
                  }
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleRedirectToProfil = () => {
    menu.current.hide();
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        navigation.navigate('Profil');
      } else {
        Alert.alert('Anda sedang offline!');
      }
    });
  };

  const handleLogout = () => {
    menu.current.hide();
    dispatch({type: ActionType.IS_LOGOUT});
    setTimeout(() => {
      navigation.navigate('Login');
    }, Alert.alert('Sesi anda telah berakhir, silahkan login kembali'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <Spinner visible={onLoad} textContent="Memproses..." />
        <View style={styles.appBar}>
          <Menu
            ref={menu}
            button={
              <Text
                onPress={() => {
                  menu.current.show();
                }}>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={25}
                  color="white"
                />
              </Text>
            }>
            <MenuItem onPress={handleSyncPembelian}>Sinkron Data</MenuItem>
            <MenuItem onPress={handleEmptyData}>Kosongkan Data</MenuItem>
            <MenuItem
              onPress={() => {
                menu.current.hide();
                getDataPembelian();
              }}>
              Muat ulang Data
            </MenuItem>
            <MenuDivider />
            <MenuItem onPress={handleRedirectToProfil}>Profil saya</MenuItem>
            <MenuItem onPress={handleLogout}>Logout</MenuItem>
          </Menu>
        </View>
        <View style={styles.body}>
          <TextInput
            style={styles.textInput}
            placeholder="Cari customer..."
            onChangeText={async (text) => {
              let result;

              try {
                if (text === '') {
                  result = await executeQuery(
                    'SELECT * FROM tbl_purchase JOIN tbl_product ON tbl_product.id_product = tbl_purchase.id_product',
                  );
                } else {
                  result = await executeQuery(
                    `SELECT * FROM tbl_purchase JOIN tbl_product
                    ON tbl_product.id_product = tbl_purchase.id_product WHERE customer LIKE '${text}' OR nama LIKE '${text}'`,
                  );
                }
                let dataOffline = [];
                for (let i = 0; i < result.rows.length; ++i) {
                  dataOffline.push(result.rows.item(i));
                }
                setData(dataOffline);
              } catch (error) {
                Alert.alert('Terjadi kesalahan!');
              }
            }}
          />
          <MaterialCommunityIcons
            name="beaker-check"
            color="black"
            size={40}
            onPress={() => {
              navigation.navigate('Print Nota PDF');
            }}
          />
        </View>

        <View style={styles.viewArea}>
          {!onLoad && data.length > 0 && (
            <FlatList
              data={data}
              ItemSeparatorComponent={listViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => listItemView(item)}
            />
          )}
          {!onLoad && !data.length > 0 && (
            <View style={styles.viewEmptyData}>
              <Text>Data Pembelian Kosong.</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default connect()(Penjualan);

const styles = StyleSheet.create({
  viewArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewEmptyData: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  listViewItemSeparator: {
    height: 0.2,
    width: '100%',
    backgroundColor: '#808080',
  },
  listView: {
    backgroundColor: 'white',
    padding: 10,
    borderColor: '#E3E6F0',
    borderWidth: 5,
  },
  button: {
    borderRadius: 5,
  },
  textInput: {
    height: 45,
    width: '95%',
    backgroundColor: '#fff',
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  body: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  safeArea: {
    flex: 1,
  },
  appBar: {
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#466BD9',
  },
});
