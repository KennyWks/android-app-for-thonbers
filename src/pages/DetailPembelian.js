import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  SafeAreaView,
  Button,
} from 'react-native';
import Spinner from '../components/SpinnerScreen';
import {executeQuery} from '../helpers/executeQuery';
import {useSelector, useDispatch} from 'react-redux';
import numeral from 'numeral';

const DetailPembelian = ({route, navigation}) => {
  let [onLoad, setOnLoad] = useState(false);
  let [data, setData] = useState([]);

  const id_saler = useSelector((state) => state.data.id_user);
  const {id} = route.params;

  useEffect(() => {
    getDataPembelian();
  }, []);

  const getDataPembelian = async () => {
    setOnLoad(true);
    try {
      const result = await executeQuery(
        `SELECT * FROM tbl_purchase 
        JOIN tbl_product 
        ON tbl_product.id_product = tbl_purchase.id_product 
        JOIN tbl_product_unit 
        ON tbl_product_unit.id = tbl_purchase.satuan 
        JOIN tbl_product_category 
        ON tbl_product_category.id = tbl_purchase.kategori 
        JOIN tbl_product_type 
        ON tbl_product_type.id = tbl_purchase.jenis 
        WHERE tbl_purchase.id=?`,
        [id],
      );
      let data = [];
      for (let i = 0; i < result.rows.length; ++i) {
        data.push(result.rows.item(i));
      }
      setData(data);
    } catch (error) {
      Alert.alert('Gagal mengambil data pembelian!');
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
              marginTop: 10,
            }}>
            <Text>Kode Produk : {item.kode_produk}</Text>
            <Text>Kategori : {item.category}</Text>
            <Text>Jenis : {item.type}</Text>
            <Text>Satuan : {item.unit}</Text>
            <Text>
              Harga Jual :{' '}
              {numeral(item.harga_jual.toString()).format('0,0[.]00')}
            </Text>
            <Text>
              Harga Pokok :{' '}
              {numeral(item.harga_pokok.toString()).format('0,0[.]00')}
            </Text>
            <Text>
              Diskon : {numeral(item.disc.toString()).format('0,0[.]00')}
            </Text>
            <Text>
              Ongkos Kirim :{' '}
              {numeral(item.ongkos_kirim.toString()).format('0,0[.]00')}
            </Text>
            <Text>
              Sub Total 1 :{' '}
              {numeral(item.sub_total1.toString()).format('0,0[.]00')}
            </Text>
            <Text>Jumlah Pemesanan : {item.qty_beli}</Text>
            <Text>
              Sub Total 2 :{' '}
              {numeral(item.sub_total2.toString()).format('0,0[.]00')}
            </Text>
            <View
              style={{
                marginTop: 10,
              }}>
              <Button
                color="#466BD9"
                title="Ubah Pembelian"
                style={styles.button}
                onPress={() => {
                  navigation.navigate('Ubah Pembelian', {
                    id: item.id,
                    id_product: item.id_product,
                    stok: item.stok,
                    harga_jual: item.harga_jual,
                    disc: item.disc,
                    ongkos_kirim: item.ongkos_kirim,
                    sub_total1: item.sub_total1,
                    qty_beli: item.qty_beli,
                    sub_total2: item.sub_total2,
                  });
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Spinner visible={onLoad} textContent="Memproses..." />
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

export default DetailPembelian;

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: '95%',
    width: '95%',
    borderRadius: 5,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'lightgrey',
    margin: 5,
    padding: 10,
  },
  button: {
    height: '18%',
    width: '80%',
    borderRadius: 5,
  },
  viewArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  viewEmptyData: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
});
