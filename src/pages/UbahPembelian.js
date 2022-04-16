import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Button,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Formik} from 'formik';
import Spinner from '../components/SpinnerScreen';
import * as Yup from 'yup';
import {executeQuery} from '../helpers/executeQuery';
import {postData} from '../helpers/CRUD';
import {toastMessage} from '../components/Toast';
import NetInfo from '@react-native-community/netinfo';
import {useSelector, useDispatch} from 'react-redux';
import numeral from 'numeral';

const UbahPembelian = ({route, navigation}) => {
  let [onLoad, setOnLoad] = useState(false);
  let [produk, setProduk] = useState([]);

  const id_saler = useSelector((state) => state.data.id_user);
  const {
    id,
    stok,
    harga_jual,
    disc,
    ongkos_kirim,
    sub_total1,
    qty_beli,
    sub_total2,
  } = route.params;

  const updateFormPembelianSchema = Yup.object().shape({
    disc: Yup.string().required('Diskon produk wajib diisi!'),
    ongkos_kirim: Yup.string().required('Ongkos kirim wajib diisi!'),
    qty_beli: Yup.string().required('Nilai pembelian wajib diisi!'),
  });

  const handleSubTotal = (args) => {
    let value;
    if (typeof args !== 'string') {
      if (isNaN(args)) {
        value = '0';
      } else {
        value = numeral(args.toString()).format('0,0[.]00');
      }
    } else {
      value = numeral(args).format('0,0[.]00');
    }
    return value;
  };

  const setConnection = () => {
    let isConnected;
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        isConnected = true;
      } else {
        isConnected = false;
      }
    });
    return isConnected;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Spinner visible={onLoad} textContent="Memproses..." />
          <Text style={styles.titleForm}>Ubah Pembelian</Text>
          <Formik
            initialValues={{
              id,
              harga_jual,
              disc,
              ongkos_kirim,
              sub_total1,
              qty_beli,
              stok,
              sub_total2,
            }}
            validationSchema={updateFormPembelianSchema}
            onSubmit={async (values, {setSubmitting, resetForm}) => {
              setOnLoad(true);
              try {
                const status = setConnection();
                if (status) {
                  await postData('/user_m/saler/purchase/edit', values);
                } else {
                  const queryAdd =
                    'UPDATE tbl_purchase set disc=?, sub_total1=?, qty_beli=?, sub_total2=? where id=?';

                  await executeQuery(queryAdd, [
                    values.id,
                    values.disc,
                    values.ongkos_kirim,
                    values.sub_total1,
                    values.qty_beli,
                    values.sub_total2,
                  ]);
                }
                // const newStok = qty_beli - values.qty_beli;
                // await executeQuery(n
                //   'UPDATE tbl_product set stok=? where id_product=?',
                //   [newStok, id_product],
                // );
                resetForm({
                  values: {
                    disc: '',
                    ongkos_kirim: '',
                    sub_total1: '',
                    qty_beli: '',
                    sub_total2: '',
                  },
                });
                setSubmitting(false);
                toastMessage('Pembelian berhasil diubah!');
                setTimeout(() => {
                  navigation.navigate('Detail Pembelian', {id: id});
                }, 200);
              } catch (error) {
                Alert.alert('Terjadi kesalahan!');
              }
              setOnLoad(false);
            }}>
            {(props) => (
              <View style={styles.cardForm}>
                <Text style={styles.styleFontLabel}>Harga Penjualan</Text>
                <TextInput
                  style={styles.textInput}
                  value={numeral(harga_jual).format('0,0[.]00')}
                  editable={false}
                />

                <Text style={styles.styleFontLabel}>Diskon</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Diskon"
                  keyboardType="number-pad"
                  value={props.values.disc}
                  onBlur={() => {
                    props.handleBlur('disc');
                    let discount = props.values.disc.replace(/,/g, '');
                    let priceOfCourier = props.values.ongkos_kirim.replace(
                      /,/g,
                      '',
                    );
                    let total = props.values.qty_beli.replace(/,/g, '');
                    let subTotal1 =
                      parseInt(harga_jual) +
                      parseInt(priceOfCourier) -
                      parseInt(discount);
                    let result = subTotal1 * parseInt(total);
                    props.setFieldValue('sub_total1', result);
                    props.setFieldValue('sub_total2', result);
                  }}
                  onChangeText={(value) => {
                    props.setFieldValue(
                      'disc',
                      numeral(value).format('0,0[.]00'),
                    );
                  }}
                />
                <Text style={styles.smallText}>
                  {props.errors.discount ? `${props.errors.discount}` : ''}
                </Text>

                <Text style={styles.styleFontLabel}>Ongkos kirim</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ongkos kirim"
                  keyboardType="number-pad"
                  value={props.values.ongkos_kirim}
                  onBlur={() => {
                    props.handleBlur('ongkos_kirim');
                    let discount = props.values.disc.replace(/,/g, '');
                    let priceOfCourier = props.values.ongkos_kirim.replace(
                      /,/g,
                      '',
                    );
                    let total = props.values.qty_beli.replace(/,/g, '');
                    let subTotal1 =
                      parseInt(harga_jual) +
                      parseInt(priceOfCourier) -
                      parseInt(discount);
                    let result = subTotal1 * parseInt(total);
                    props.setFieldValue('sub_total1', result);
                    props.setFieldValue('sub_total2', result);
                  }}
                  onChangeText={(value) => {
                    props.setFieldValue(
                      'ongkos_kirim',
                      numeral(value).format('0,0[.]00'),
                    );
                  }}
                />
                <Text style={styles.smallText}>
                  {props.errors.ongkos_kirim
                    ? `${props.errors.ongkos_kirim}`
                    : ''}
                </Text>

                <Text style={styles.styleFontLabel}>Sub Total 1</Text>
                <TextInput
                  style={styles.textInput}
                  value={handleSubTotal(props.values.sub_total1)}
                  editable={false}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 2,
                      margin: 3,
                    }}>
                    <Text style={styles.styleFontLabel}>Qty Beli</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Total pembelian"
                      keyboardType="number-pad"
                      value={`${props.values.qty_beli}`}
                      onBlur={() => {
                        props.handleBlur('qty_beli');
                        let discount = props.values.disc.replace(/,/g, '');
                        let priceOfCourier = props.values.ongkos_kirim.replace(
                          /,/g,
                          '',
                        );
                        let total = props.values.qty_beli.replace(/,/g, '');
                        let subTotal1 =
                          parseInt(harga_jual) +
                          parseInt(priceOfCourier) -
                          parseInt(discount);
                        let result = subTotal1 * parseInt(total);
                        props.setFieldValue('sub_total2', result);
                      }}
                      onChangeText={(value) => {
                        props.setFieldValue('qty_beli', value);
                      }}
                    />
                    <Text style={styles.smallText}>
                      {props.errors.qty_beli ? `${props.errors.qty_beli}` : ''}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 1,
                      margin: 3,
                    }}>
                    <Text style={styles.styleFontLabel}>Stok</Text>
                    <TextInput
                      style={styles.textInput}
                      value={`${props.values.stok}`}
                      editable={false}
                    />
                  </View>
                </View>

                <Text style={styles.styleFontLabel}>Sub Total 2</Text>
                <TextInput
                  style={styles.textInput}
                  value={handleSubTotal(props.values.sub_total2)}
                  editable={false}
                />

                <Button
                  color="#3960CF"
                  title="Simpan"
                  style={styles.button}
                  onPress={props.handleSubmit}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </View>
  );
};

export default UbahPembelian;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: '100%',
    width: '95%',
    borderRadius: 5,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'lightgrey',
    margin: 5,
  },
  textInput: {
    height: 45,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 3,
    color: 'black',
  },
  styleFontLabel: {
    color: '#7f7f7f',
    marginTop: 5,
  },
  smallText: {
    fontSize: 11,
    color: 'red',
    margin: 0,
    padding: 1,
  },
  button: {
    height: '18%',
    width: '80%',
    borderRadius: 5,
  },
  cardForm: {
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '90%',
  },
  titleForm: {
    textAlign: 'center',
    fontSize: 16,
  },
});
