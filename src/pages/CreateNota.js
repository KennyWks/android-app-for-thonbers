import React, {useState, useEffect, useRef} from 'react';
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
import RNPickerSelect from 'react-native-picker-select';
import {Formik} from 'formik';
import Spinner from '../components/SpinnerScreen';
import * as Yup from 'yup';
import {executeQuery} from '../helpers/executeQuery';
import {getData, postData} from '../helpers/CRUD';
import {toastMessage} from '../components/Toast';
import NetInfo from '@react-native-community/netinfo';
import {useSelector, useDispatch} from 'react-redux';
import numeral from 'numeral';

const CreateNota = ({route, navigation}) => {
  let [onLoad, setOnLoad] = useState(false);
  let [types, setTypes] = useState([]);
  let [units, setUnits] = useState([]);
  let [categories, setCategories] = useState([]);
  let [valid, setValid] = useState('');
  let [carrier, setCarrier] = useState('');
  let [btnSubmit, setBtnSubmit] = useState(true);
  let [hp, setHp] = useState('');

  const id_saler = useSelector((state) => state.data.id_user);
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
  } = route.params;

  const notaFormSchema = Yup.object().shape({
    customer: Yup.string()
      .required('Nomor HP wajib diisi!')
      .min(11, 'Nomor HP minimal 11 karakter!')
      .max(12, 'Nomor HP maksimal 12 karakter!'),
    type: Yup.string().required('Jenis produk wajib dipilih!'),
    category: Yup.string().required('Kategori produk wajib dipilih!'),
    unit: Yup.string().required('Unit produk wajib dipilih!'),
    discount: Yup.string().required('Diskon produk wajib diisi!'),
    priceOfCourier: Yup.string().required('Ongkos kirim wajib diisi!'),
    total: Yup.string().required('Nilai pembelian wajib diisi!'),
  });

  let refData = {
    refCategory: null,
    refUnit: null,
    refType: null,
  };

  useEffect(() => {
    getDataTypes();
    getDataUnits();
    getDataCategories();
  }, []);

  const getDataTypes = async () => {
    setOnLoad(true);
    try {
      const result = await executeQuery('SELECT * FROM tbl_product_type');
      let data = [];
      for (let i = 0; i < result.rows.length; ++i) {
        data.push(result.rows.item(i));
      }
      setTypes(data);
    } catch (error) {
      toastMessage('Terjadi kesalahan saat mengambil data jenis!');
    }
  };

  const getDataUnits = async () => {
    try {
      const result = await executeQuery('SELECT * FROM tbl_product_unit');
      let data = [];
      for (let i = 0; i < result.rows.length; ++i) {
        data.push(result.rows.item(i));
      }
      setUnits(data);
    } catch (error) {
      toastMessage('Terjadi kesalahan saat mengambil data unit!');
    }
  };

  const getDataCategories = async () => {
    try {
      const result = await executeQuery('SELECT * FROM tbl_product_category');
      let data = [];
      for (let i = 0; i < result.rows.length; ++i) {
        data.push(result.rows.item(i));
      }
      setCategories(data);
    } catch (error) {
      toastMessage('Terjadi kesalahan saat mengambil data kategori!');
    }
    setOnLoad(false);
  };

  const dataCategory = () => {
    let data = [];
    categories.length > 0
      ? categories.map((v) => {
          data.push({label: v.category, value: v.id});
        })
      : data.push({label: 'Pilih kategori produk', value: ''});
    return data;
  };

  const dataUnit = () => {
    let data = [];
    units.length > 0
      ? units.map((v) => {
          data.push({label: v.unit, value: v.id});
        })
      : data.push({label: 'Pilih unit produk', value: ''});
    return data;
  };

  const dataType = () => {
    let data = [];
    types.length > 0
      ? types.map((v) => {
          data.push({label: v.type, value: v.id});
        })
      : data.push({label: 'Pilih jenis produk', value: ''});
    return data;
  };

  const handleCheckNumber = async () => {
    setValid('');
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        checkNoHP(hp);
      } else {
        checkNoHPOffline(hp);
      }
    });
  };

  const checkNoHP = async (customer) => {
    setOnLoad(true);
    const status = setConnection();
    try {
      if (status) {
        const response = await getData(
          `/user_m/kunjungan/customer/checkhp/${customer}`,
        );
        if (response.data.valid === 'exists') {
          setValid(response.data.valid);
          setCarrier(response.data.carrier);
          setBtnSubmit(false);
        } else if (response.data.valid === true) {
          setValid(response.data.valid);
          setCarrier(response.data.carrier);
          setBtnSubmit(true);
        } else {
          setValid(response.data.valid);
          setCarrier(response.data.carrier);
          setBtnSubmit(true);
        }
      } else {
        const resultHP = await executeQuery(
          `SELECT * FROM tbl_customer WHERE no_hp = '${customer}'`,
        );
        if (resultHP.rows.length > 0) {
          setValid('exists');
          setBtnSubmit(false);
        } else {
          setValid(true);
          setBtnSubmit(true);
        }
      }
    } catch (error) {
      Alert.alert('Terjadi Kesalahan');
    }
    setOnLoad(false);
  };

  const checkNoHPOffline = () => {
    setOnLoad(true);
    setOnLoad(false);
  };

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

  const handleSetNumInfo = () => {
    if (valid === 'exists') {
      return (
        <Text style={styles.smallText}>
          Nomor HP sudah ada, silahkan lanjutkan.
        </Text>
      );
    } else if (valid === true) {
      return (
        <View style={{marginTop: 10}}>
          <Text style={styles.smallText}>
            Nomor HP aktif, klik tombol dibawah ini untuk melanjutkan.
          </Text>
          <View style={styles.containerButtonTouchable}>
            <TouchableOpacity
              onPress={() => {
                setValid('');
                setCarrier('');
                navigation.push('Home');
              }}>
              <View style={styles.buttonTouchableOpacity}>
                <Text style={styles.buttonText}>Tambah Pelanggan</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (valid === false) {
      return <Text style={styles.smallText}>Nomor ini tidak aktif.</Text>;
    } else {
      return <Text style={styles.smallText}>*</Text>;
    }
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
          <Text style={styles.titleForm}>Item Pembelian Baru</Text>
          <Formik
            initialValues={{
              stok: stok,
              id_saler: id_saler,
              id_product: id_product,
              customer: '',
              type: type,
              category: category,
              unit: unit,
              priceOfSell: harga_jual,
              discount: '0',
              priceOfCourier: '0',
              subTotal1: '0',
              total: '1',
              subTotal2: '0',
            }}
            validationSchema={notaFormSchema}
            onSubmit={async (values, {setSubmitting, resetForm}) => {
              if (values.total <= stok) {
                setOnLoad(true);
                try {
                  const status = setConnection();
                  if (status) {
                    await postData('/user_m/saler/purchase/add', values);
                  } else {
                    const queryAdd =
                      'INSERT INTO tbl_purchase (id_saler, id_product, customer, jenis, kategori, satuan, disc, ongkos_kirim, sub_total1, qty_beli, sub_total2, submited) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';

                    await executeQuery(queryAdd, [
                      values.id_saler,
                      values.id_product,
                      values.customer,
                      values.type,
                      values.category,
                      values.unit,
                      values.discount,
                      values.priceOfCourier,
                      values.subTotal1,
                      values.total,
                      values.subTotal2,
                      0,
                    ]);
                  }
                  const newStok = stok - values.total;
                  await executeQuery(
                    'UPDATE tbl_product set stok=? where id_product=?',
                    [newStok, id_product],
                  );
                  resetForm({
                    values: {
                      customer: '',
                      type: type,
                      category: category,
                      unit: unit,
                      discount: '0',
                      priceOfCourier: '0',
                      subTotal1: '0',
                      total: '1',
                      subTotal2: '0',
                    },
                  });
                  setValid('');
                  setSubmitting(false);
                  toastMessage('Pembelian berhasil diproses!');
                  setTimeout(() => {
                    navigation.navigate('Home');
                  }, 200);
                } catch (error) {
                  Alert.alert('Terjadi kesalahan!');
                }
                setOnLoad(false);
              } else {
                Alert.alert('Pembelian melebihi stok!');
              }
            }}>
            {(props) => (
              <View style={styles.cardForm}>
                <Text style={styles.styleFontLabel}>Nama</Text>
                <TextInput
                  style={styles.textInput}
                  value={nama}
                  editable={false}
                />

                <Text style={styles.styleFontLabel}>Kode Produk</Text>
                <TextInput
                  style={styles.textInput}
                  value={kode_produk}
                  editable={false}
                />

                <View style={styles.cardNumber}>
                  <View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Nomor HP..."
                      keyboardType="phone-pad"
                      value={props.values.customer}
                      onChangeText={(value) => {
                        props.setFieldValue('customer', value);
                        setHp(value);
                      }}
                    />
                    <Text style={styles.smallText}>
                      {props.errors.customer ? `${props.errors.customer}` : ''}
                    </Text>
                  </View>
                  <Button
                    color="#3960CF"
                    title="Cek Nomor"
                    style={styles.button}
                    disabled={props.errors.customer ? true : false}
                    onPress={() => {
                      handleCheckNumber();
                    }}
                  />
                  {handleSetNumInfo()}
                </View>

                <Text style={styles.styleFontLabel}>Jenis Produk</Text>
                <RNPickerSelect
                  onValueChange={(value) => {
                    props.setFieldValue('type', value);
                  }}
                  value={props.values.type}
                  placeholder={{
                    label: 'Pilih jenis produk',
                    value: '',
                    color: 'red',
                  }}
                  useNativeAndroidPickerStyle={false}
                  items={dataType()}
                  ref={(el) => {
                    refData.refType = el;
                  }}
                  returnKeyType="next"
                  enablesReturnKeyAutomatically
                  onSubmitEditing={() => {
                    props.values.type.togglePicker();
                  }}
                  blurOnSubmit={false}
                  style={pickerStyle}
                />
                <Text style={styles.smallText}>
                  {props.errors.type ? `${props.errors.type}` : ''}
                </Text>

                <Text style={styles.styleFontLabel}>Kategori Produk</Text>
                <RNPickerSelect
                  onValueChange={(value) => {
                    props.setFieldValue('category', value);
                  }}
                  value={props.values.category}
                  placeholder={{
                    label: 'Pilih kategori produk',
                    value: '',
                    color: 'red',
                  }}
                  useNativeAndroidPickerStyle={false}
                  items={dataCategory()}
                  ref={(el) => {
                    refData.refCategory = el;
                  }}
                  returnKeyType="next"
                  enablesReturnKeyAutomatically
                  onSubmitEditing={() => {
                    props.values.category.togglePicker();
                  }}
                  blurOnSubmit={false}
                  style={pickerStyle}
                />
                <Text style={styles.smallText}>
                  {props.errors.category ? `${props.errors.category}` : ''}
                </Text>

                <Text style={styles.styleFontLabel}>Unit Produk</Text>
                <RNPickerSelect
                  onValueChange={(value) => {
                    props.setFieldValue('unit', value);
                  }}
                  value={props.values.unit}
                  placeholder={{
                    label: 'Pilih satuan produk',
                    value: '',
                    color: 'red',
                  }}
                  useNativeAndroidPickerStyle={false}
                  items={dataUnit()}
                  ref={(el) => {
                    refData.refUnit = el;
                  }}
                  returnKeyType="next"
                  enablesReturnKeyAutomatically
                  onSubmitEditing={() => {
                    props.values.unit.togglePicker();
                  }}
                  blurOnSubmit={false}
                  style={pickerStyle}
                />
                <Text style={styles.smallText}>
                  {props.errors.unit ? `${props.errors.unit}` : ''}
                </Text>

                <Text style={styles.styleFontLabel}>Harga Pembelian</Text>
                <TextInput
                  style={styles.textInput}
                  value={numeral(harga_pokok).format('0,0[.]00')}
                  editable={false}
                />

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
                  value={props.values.discount}
                  onBlur={() => {
                    props.handleBlur('discount');
                    let discount = props.values.discount.replace(/,/g, '');
                    let priceOfCourier = props.values.priceOfCourier.replace(
                      /,/g,
                      '',
                    );
                    let total = props.values.total.replace(/,/g, '');
                    let subTotal1 =
                      parseInt(harga_jual) +
                      parseInt(priceOfCourier) -
                      parseInt(discount);
                    let result = subTotal1 * parseInt(total);
                    props.setFieldValue('subTotal1', result);
                    props.setFieldValue('subTotal2', result);
                  }}
                  onChangeText={(value) => {
                    props.setFieldValue(
                      'discount',
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
                  value={props.values.priceOfCourier}
                  onBlur={() => {
                    props.handleBlur('priceOfCourier');
                    let discount = props.values.discount.replace(/,/g, '');
                    let priceOfCourier = props.values.priceOfCourier.replace(
                      /,/g,
                      '',
                    );
                    let total = props.values.total.replace(/,/g, '');
                    let subTotal1 =
                      parseInt(harga_jual) +
                      parseInt(priceOfCourier) -
                      parseInt(discount);
                    let result = subTotal1 * parseInt(total);
                    props.setFieldValue('subTotal1', result);
                    props.setFieldValue('subTotal2', result);
                  }}
                  onChangeText={(value) => {
                    props.setFieldValue(
                      'priceOfCourier',
                      numeral(value).format('0,0[.]00'),
                    );
                  }}
                />
                <Text style={styles.smallText}>
                  {props.errors.priceOfCourier
                    ? `${props.errors.priceOfCourier}`
                    : ''}
                </Text>

                <Text style={styles.styleFontLabel}>Sub Total 1</Text>
                <TextInput
                  style={styles.textInput}
                  value={handleSubTotal(props.values.subTotal1)}
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
                      value={props.values.total}
                      onBlur={() => {
                        props.handleBlur('total');
                        let discount = props.values.discount.replace(/,/g, '');
                        let priceOfCourier =
                          props.values.priceOfCourier.replace(/,/g, '');
                        let total = props.values.total.replace(/,/g, '');
                        let subTotal1 =
                          parseInt(harga_jual) +
                          parseInt(priceOfCourier) -
                          parseInt(discount);
                        let result = subTotal1 * parseInt(total);
                        props.setFieldValue('subTotal2', result);
                      }}
                      onChangeText={(value) => {
                        props.setFieldValue('total', value);
                      }}
                    />
                    <Text style={styles.smallText}>
                      {props.errors.total ? `${props.errors.total}` : ''}
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
                      value={`${stok}`}
                      editable={false}
                    />
                  </View>
                </View>

                <Text style={styles.styleFontLabel}>Sub Total 2</Text>
                <TextInput
                  style={styles.textInput}
                  value={handleSubTotal(props.values.subTotal2)}
                  editable={false}
                />

                <Button
                  color="#3960CF"
                  title="Simpan"
                  disabled={btnSubmit}
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

export default CreateNota;

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
  cardNumber: {
    marginTop: 5,
    marginBottom: 10,
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
  containerButtonTouchable: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTouchableOpacity: {
    width: '100%',
    backgroundColor: '#2653D4',
    borderRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
    padding: 10,
    color: 'white',
  },
});

const pickerStyle = {
  inputAndroid: {
    height: 45,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 5,
    color: 'black',
    padding: 10,
  },
};
