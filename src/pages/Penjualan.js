import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  Button,
  TextInput,
  PermissionsAndroid,
  SafeAreaView,
  Platform,
} from 'react-native';
import Spinner from '../components/SpinnerScreen';
import {connect} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {getData, patchData} from '../helpers/CRUD';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import ActionType from '../redux/reducer/globalActionType';
import SQLite from 'react-native-sqlite-storage';
import {useSelector, useDispatch} from 'react-redux';
import {RNCamera} from 'react-native-camera';
import {toastMessage} from '../components/Toast';

const Penjualan = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const menu = useRef();
  let camera = useRef();

  let [data, setData] = useState([]);
  let [onLoad, setOnLoad] = useState(false);
  let [torchOn, setTorchOn] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);

  // const userData = useSelector((state) => state.data);
  const dispatch = useDispatch();

  useEffect(() => {
    getDataProduct();
  }, []);

  const getDataProduct = async () => {
    setOnLoad(true);
    try {
      await executeQuery(
        'CREATE TABLE IF NOT EXISTS tbl_product(id_product INTEGER PRIMARY KEY, kode_produk VARCHAR(100), nama VARCHAR(254), harga_pokok DECIMAL(18,2), harga_jual DECIMAL(18,2), stok INT(11), category INT(11), unit INT(11), type INT(11), created_at VARCHAR(200), updated_at VARCHAR(200))',
      );

      await executeQuery(
        'CREATE TABLE IF NOT EXISTS tbl_product_unit(id INTEGER PRIMARY KEY, unit VARCHAR(100))',
      );

      await executeQuery(
        'CREATE TABLE IF NOT EXISTS tbl_product_type(id INTEGER PRIMARY KEY, type VARCHAR(100))',
      );

      await executeQuery(
        'CREATE TABLE IF NOT EXISTS tbl_product_category(id INTEGER PRIMARY KEY, category VARCHAR(100))',
      );

      await executeQuery(
        'CREATE TABLE IF NOT EXISTS tbl_purchase(id INTEGER PRIMARY KEY AUTOINCREMENT, id_saler INT(11), id_product INT(11), customer VARCHAR(12), jenis INT(11), kategori INT(11), satuan INT(11), disc DECIMAL(18,2), ongkos_kirim DECIMAL(18,2), sub_total1 DECIMAL(18,2), qty_beli INT(11), sub_total2 DECIMAL(18,2), submited INT(1))',
      );

      const getDataOffline = await executeQuery(
        'SELECT * FROM tbl_product ORDER BY id_product DESC',
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

  const executeSqlForTable = async (args1, args2) => {
    await executeQuery(`DELETE FROM tbl_product_${args2}`);

    let property;
    for (let i = 0; i < args1.length; i++) {
      if (args2 === 'unit') {
        property = args1[i].unit;
      } else if (args2 === 'type') {
        property = args1[i].type;
      } else {
        property = args1[i].category;
      }
      try {
        await executeQuery(
          `INSERT INTO tbl_product_${args2} (id, ${args2}) VALUES (?,?)`,
          [args1[i].id, property],
        );
      } catch (error) {
        toastMessage(`Data ${args2} gagal disinkron`);
      }
    }
  };

  const handleSyncProduct = async () => {
    menu.current.hide();
    setOnLoad(true);
    try {
      const responseUnit = await getData('/user_m/saler/product/unit');
      await executeSqlForTable(responseUnit.data.data, 'unit');

      const responseType = await getData('/user_m/saler/product/type');
      await executeSqlForTable(responseType.data.data, 'type');

      const responseCategory = await getData('/user_m/saler/product/category');
      await executeSqlForTable(responseCategory.data.data, 'category');

      const responseProduct = await getData('/user_m/saler/product/show');
      const onlineData = responseProduct.data.data;

      for (let i = 0; i < onlineData.length; i++) {
        const results = await executeQuery(
          `SELECT * FROM tbl_product WHERE id_product = ${onlineData[i].id_product}`,
        );

        if (results.rows.length > 0) {
          let dataConditionOffline = [];
          for (let j = 0; j < results.rows.length; ++j) {
            dataConditionOffline.push(results.rows.item(j));
          }
          for (let k = 0; k < dataConditionOffline.length; k++) {
            const responseSingleProduct = await getData(
              `/user_m/saler/product/show/${dataConditionOffline[k].id_product}`,
            );
            const {stok} = responseSingleProduct.data.data[0];

            if (dataConditionOffline[k].stok != stok) {
              await patchData(
                `/user_m/saler/product/update/stok/${data[k].id_product}`,
                data[k].stok,
              );
            }
          }
        } else {
          const queryAdd =
            'INSERT INTO tbl_product (id_product, kode_produk, nama, harga_pokok, harga_jual, stok, category, unit, type, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)';

          await executeQuery(queryAdd, [
            onlineData[i].id_product,
            onlineData[i].kode_produk,
            onlineData[i].nama,
            onlineData[i].harga_pokok,
            onlineData[i].harga_jual,
            onlineData[i].stok,
            onlineData[i].category,
            onlineData[i].unit,
            onlineData[i].type,
            onlineData[i].created_at,
            onlineData[i].updated_at,
          ]);
        }
      }
    } catch (error) {
      Alert.alert('Terjadi kesalahan!');
    }
    getDataProduct();
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
        await executeQuery('DELETE FROM tbl_product');
        toastMessage('Berhasil mengkosongkan data');
        getDataProduct();
      } catch (error) {
        toastMessage('Gagal mengkosongkan data');
      }
    } else {
      Alert.alert('Data pelanggan kosong');
    }
    setOnLoad(false);
  };

  let listViewItemSeparator = () => {
    return <View style={styles.listViewItemSeparator} />;
  };

  const handleAddNota = (item) => {
    const {
      id_product,
      stok,
      kode_produk,
      nama,
      harga_pokok,
      harga_jual,
      category,
      unit,
      type,
    } = item;

    navigation.navigate('Buat Nota', {
      id_product,
      stok,
      kode_produk,
      nama,
      harga_pokok,
      harga_jual,
      category,
      unit,
      type,
    });
  };

  let listItemView = (item) => {
    return (
      <View key={item.id_product} style={styles.listView}>
        <View>
          <Text>{item.kode_produk}</Text>
          <Text>{item.nama}</Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text>Harga Pokok : IDR {item.harga_pokok}</Text>
              <Text>Harga Jual : IDR {item.harga_jual}</Text>
              <Text>Stok : {item.stok}</Text>
            </View>
            <View>
              <Button
                color="#169B6B"
                title="Nota +"
                style={styles.button}
                onPress={() => {
                  handleAddNota(item);
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

  const onBarCodeRead = async (e) => {
    // Alert.alert('Barcode value is' + e.data, 'Barcode type is' + e.type);
    try {
      const result = await executeQuery(
        `SELECT * FROM tbl_product WHERE kode_produk = '${e.data}'`,
      );

      let dataOffline = [];
      for (let i = 0; i < result.rows.length; ++i) {
        dataOffline.push(result.rows.item(i));
      }
      setData(dataOffline);
    } catch (error) {
      Alert.alert('Terjadi kesalahan!');
    }
    setOpenScanner(false);
  };

  const onOpenScanner = () => {
    // To Start Scanning
    if (Platform.OS === 'android') {
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Izin Akses Kamera',
              message: 'App ini meminta izin untuk mengakses kamera',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // If CAMERA Permission is granted
            setOpenScanner(true);
          } else {
            Alert.alert('Akses kamera ditolak');
          }
        } catch (err) {
          Alert.alert('Camera permission err', err);
        }
      }
      // Calling the camera permission function
      requestCameraPermission();
    } else {
      setOpenScanner(true);
    }

    if (torchOn === true) {
      setTorchOn(false);
    } else {
      setTorchOn(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {openScanner ? (
        <RNCamera
          style={styles.preview}
          flashMode={
            torchOn
              ? RNCamera.Constants.FlashMode.torch
              : RNCamera.Constants.FlashMode.off
          }
          onBarCodeRead={onBarCodeRead}
          ref={(cam) => (camera = cam)}
          cameraViewDimensions={{
            width: 100,
            height: 100,
          }}>
          <Text style={styles.barcodeText}>SCAN BARCODE PRODUK</Text>
        </RNCamera>
      ) : (
        <View
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
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
              <MenuItem onPress={handleSyncProduct}>Sinkron Data</MenuItem>
              <MenuItem onPress={handleEmptyData}>Kosongkan Data</MenuItem>
              <MenuItem
                onPress={() => {
                  menu.current.hide();
                  getDataProduct();
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
              placeholder="Cari kode produk..."
              onChangeText={async (text) => {
                let result;
                try {
                  if (text === '') {
                    result = await executeQuery('SELECT * FROM tbl_product');
                  } else {
                    result = await executeQuery(
                      `SELECT * FROM tbl_product WHERE kode_produk LIKE '${text}' OR nama LIKE '${text}'`,
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
              name="barcode-scan"
              color="black"
              size={25}
              onPress={onOpenScanner}
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
                <Text>Data Produk Kosong.</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default connect()(Penjualan);

const styles = StyleSheet.create({
  appBar: {
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#466BD9',
  },
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
    width: '80%',
    backgroundColor: '#fff',
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  body: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 5,
  },
  barcodeText: {
    backgroundColor: 'white',
    margin: 5,
    padding: 5,
  },
  safeArea: {
    flex: 1,
  },
});
