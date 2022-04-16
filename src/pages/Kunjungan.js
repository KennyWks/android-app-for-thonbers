import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DocumentPicker from 'react-native-document-picker';
import Geolocation from 'react-native-geolocation-service';
import {connect} from 'react-redux';
import ActionType from '../redux/reducer/globalActionType';
import {postData, getData} from '../helpers/CRUD';
import {Formik} from 'formik';
import Spinner from '../components/SpinnerScreen';
import * as Yup from 'yup';
import SQLite from 'react-native-sqlite-storage';
import moment from 'moment';
import {toastMessage} from '../components/Toast';
import NetInfo from '@react-native-community/netinfo';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import {SafeAreaView} from 'react-native-safe-area-context';
import RNMockLocationDetector from 'react-native-mock-location-detector';

const kunjunganFormSchema = Yup.object().shape({
  no_hp: Yup.string()
    .required('Nomor HP wajib diisi!')
    .min(11, 'Nomor HP minimal 11 karakter!')
    .max(12, 'Nomor HP maksimal 12 karakter!'),
  nama: Yup.string().required('Nama wajib diisi!'),
  tempat_lahir: Yup.string().required('Tempat lahir wajib diisi!'),
  tgl_lahir: Yup.string().required('Tanggal lahir wajib diisi!'),
  agama: Yup.string().required('Agama wajib dipilih!'),
  jk: Yup.string().required('Jenis Kelamin wajib dipilih!'),
  email: Yup.string()
    .required('Alamat email wajib diisi!')
    .email('Alamat email tidak valid!'),
  alamat: Yup.string().required('Alamat wajib diisi!'),
});

class Kunjungan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        latitude: '',
        longitude: '',
        no_hp: '',
        nama: '',
        tempat_lahir: '',
        tgl_lahir: moment().format('YYYY-MM-DD'),
        agama: '',
        jk: '',
        email: '',
        alamat: '',
        foto: '',
        created_by: '',
      },
      show: false,
      onSubmit: false,
      dataCheckNumber: {
        valid: '',
        carrier: '',
        btnSubmit: props.isConnected,
      },
      isConnected: props.isConnected,
    };
  }

  componentDidMount() {
    this.props.handleConnections();
  }

  setConnection = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.setState((prevState) => ({
          ...prevState,
          dataCheckNumber: {
            ...prevState.dataCheckNumber,
            btnSubmit: true,
          },
          isConnected: true,
        }));
      } else {
        this.setState((prevState) => ({
          ...prevState,
          dataCheckNumber: {
            ...prevState.dataCheckNumber,
            btnSubmit: false,
          },
          isConnected: false,
        }));
      }
    });
  };

  getCurrentPosition = async (options) => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error),
        options,
      );
    });
  };

  getUserLocation = async () => {
    const locationOptions =
      Platform.OS === 'android'
        ? {enableHighAccuracy: true, timeout: 100000, maximumAge: 1000}
        : null;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Lokasi perangkat',
          message:
            'Menambahkan pelanggan membutuhkan akses lokasi perangkat anda' +
            ' Mohon pilih menu dibawah ini untuk melanjutkan.',
          buttonNeutral: 'Tanya nanti',
          buttonNegative: 'Batal',
          buttonPositive: 'Setuju',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        toastMessage('Akses lokasi ditolak');
      }
    } catch (err) {
      Alert.alert('Terjadi kesalahan saat mendapatkan lokasi');
    }

    return await this.getCurrentPosition(locationOptions);
  };

  handleAddKunjungan = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onSubmit: true,
    }));

    let result;

    const {foto} = this.state.form;

    const isLocationMocked =
      await RNMockLocationDetector.checkMockLocationProvider();

    if (foto) {
      if (isLocationMocked) {
        Alert.alert('Lokasi anda tidak valid!');
      } else {
        this.setConnection();
        try {
          let position = await this.getUserLocation();
          this.setState((prevState) => ({
            ...prevState,
            form: {
              ...prevState.form,
              latitude: position.latitude,
              longitude: position.longitude,
            },
          }));
          if (this.state.isConnected) {
            // result = await this.handleAddKunjunganOnlineMode();
            result = await this.handleAddKunjunganOfflineMode();
          } else {
            result = await this.handleAddKunjunganOfflineMode();
          }
        } catch (error) {
          Alert.alert('Lokasi anda tidak valid!');
        }
      }
    } else {
      Alert.alert('Anda belum memilih foto!');
    }
    this.setState((prevState) => ({
      ...prevState,
      onSubmit: false,
    }));

    return result;
  };

  handleSetContentFormData = () => {
    this.setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        latitude: '',
        longitude: '',
        no_hp: '',
        nama: '',
        tempat_lahir: null,
        tgl_lahir: '',
        agama: '',
        jk: '',
        email: '',
        alamat: '',
        foto: '',
      },
    }));
  };

  handleAddKunjunganOnlineMode = async () => {
    const {form} = this.state;

    let formData = new FormData();
    formData.append('latitude', form.latitude);
    formData.append('longitude', form.longitude);
    formData.append('no_hp', form.no_hp);
    formData.append('nama', form.nama);
    formData.append('tempat_lahir', form.tempat_lahir);
    formData.append('tgl_lahir', form.tgl_lahir);
    formData.append('agama', form.agama);
    formData.append('jk', form.jk);
    formData.append('email', form.email);
    formData.append('alamat', form.alamat);
    formData.append('created_by', form.created_by);
    formData.append('foto', form.foto);

    let status = false;

    try {
      const response = await postData(
        '/user_m/kunjungan/customer/add',
        formData,
      );
      status = true;
      toastMessage(response.data.msg);
    } catch (error) {
      if (error.response.status !== 404) {
        const {msg} = error.response.data;
        if (msg.no_hp || msg.email) {
          if (msg.no_hp && msg.email) {
            toastMessage(msg.no_hp);
            toastMessage(msg.email);
          } else {
            let message = msg.no_hp ? msg.no_hp : msg.email;
            Alert.alert(message);
          }
        } else {
          Alert.alert(msg);
        }
      } else {
        Alert.alert('Terjadi kesalahan!');
      }
    }

    return status;
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

  handleAddKunjunganOfflineMode = async () => {
    const query =
      'INSERT INTO tbl_customer (nama, tempat_lahir, tgl_lahir, no_hp, email, agama, jk, alamat, fotoName, fotoUri, latitude, longitude, submited, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

    const data = [
      this.state.form.nama,
      this.state.form.tempat_lahir,
      this.state.form.tgl_lahir,
      this.state.form.no_hp,
      this.state.form.email,
      this.state.form.agama,
      this.state.form.jk,
      this.state.form.alamat,
      this.state.form.foto.name,
      this.state.form.foto.uri,
      this.state.form.latitude,
      this.state.form.longitude,
      0,
      this.state.form.created_by,
    ];

    let status = false;

    try {
      const resultHP = await this.executeQuery(
        `SELECT * FROM tbl_customer WHERE no_hp = '${this.state.form.no_hp}'`,
      );
      if (resultHP.rows.length > 0) {
        status = true;
        Alert.alert('Nomor HP sudah ada di dalam database offline!');
      } else {
        await this.executeQuery(query, data);
        status = true;
        toastMessage('Pelanggan berhasil ditambahkan');
      }
    } catch (error) {
      toastMessage('Pelanggan gagal ditambahkan');
    }

    return status;
  };

  setFile = (params) => {
    this.setState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        foto: params,
      },
    }));
  };

  handleSelectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      if (res.type === 'image/jpeg' || res.type === 'image/jpg') {
        this.setFile(res);
      } else {
        Alert.alert('Format gambar tidak didukung');
      }
    } catch (err) {
      this.setFile(null);
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('Upload dibatalkan');
      } else {
        Alert.alert('Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };

  handleCheckHP = async () => {
    const {no_hp} = this.state.form;

    if (no_hp) {
      this.setState((prevState) => ({
        ...prevState,
        onSubmit: true,
        dataCheckNumber: {
          ...prevState.dataCheckNumber,
          valid: '',
        },
      }));

      try {
        const response = await getData(
          `/user_m/kunjungan/customer/checkhp/${no_hp}`,
        );
        if (response.data.valid === 'exists') {
          this.setState((prevState) => ({
            ...prevState,
            dataCheckNumber: {
              ...prevState.dataCheckNumber,
              valid: response.data.valid,
              carrier: response.data.carrier,
              btnSubmit: true,
            },
          }));
        } else if (response.data.valid === true) {
          this.setState((prevState) => ({
            ...prevState,
            dataCheckNumber: {
              ...prevState.dataCheckNumber,
              valid: response.data.valid,
              carrier: response.data.carrier,
              btnSubmit: false,
            },
          }));
        } else {
          this.setState((prevState) => ({
            ...prevState,
            dataCheckNumber: {
              ...prevState.dataCheckNumber,
              valid: response.data.valid,
              carrier: response.data.carrier,
              btnSubmit: true,
            },
          }));
        }
      } catch (error) {
        this.setConnection();
        Alert.alert(
          'Koneksi internet terputus!',
          'Jika anda tidak terkoneksi internet, silahkan lanjut untuk mengisi data. Data dimasukan akan disimpan secara offline',
        );
      }
      this.setState((prevState) => ({
        ...prevState,
        onSubmit: false,
      }));
    } else {
      Alert.alert('Nomor HP wajib diisi!');
    }
  };

  handleSetNumInfo = () => {
    const {dataCheckNumber} = this.state;
    let numInfo = '';
    if (dataCheckNumber.valid === true) {
      numInfo = 'Nomor ini aktif.';
    } else if (dataCheckNumber.valid === 'exists') {
      numInfo = 'Nomor sudah ada di dalam sistem.';
    } else if (dataCheckNumber.valid === false) {
      numInfo = 'Nomor ini tidak aktif.';
    } else {
      numInfo = '';
    }
    return numInfo;
  };

  _menu = null;

  handleRedirectToProfil = () => {
    this._menu.hide();
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.props.navigation.push('Profil');
      } else {
        Alert.alert('Anda sedang offline!');
      }
    });
  };

  handleRedirectToDataKunjunganOffline = () => {
    this._menu.hide();
    this.props.navigation.push('Pelanggan');
  };

  handleLogout = () => {
    this._menu.hide();
    this.props.handleLogout();
    setTimeout(() => {
      this.props.navigation.navigate('Login');
    }, Alert.alert('Sesi anda telah berakhir, silahkan login kembali'));
  };

  render() {
    const {form, show, dataCheckNumber, onSubmit} = this.state;
    return (
      <SafeAreaView style={styles.safeAreaStyle}>
        <View style={styles.appBar}>
          <Menu
            ref={(ref) => {
              this._menu = ref;
            }}
            button={
              <Text
                onPress={() => {
                  this._menu.show();
                }}>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={25}
                  color="white"
                />
              </Text>
            }>
            <MenuItem onPress={this.handleRedirectToDataKunjunganOffline}>
              Pelanggan - Offline
            </MenuItem>
            <MenuDivider />
            <MenuItem onPress={this.handleRedirectToProfil}>
              Profil saya
            </MenuItem>
            <MenuItem onPress={this.handleLogout}>Keluar</MenuItem>
          </Menu>
        </View>
        <ScrollView>
          <View style={styles.content}>
            <Spinner visible={onSubmit} textContent="Memproses..." />
            <Text style={styles.titleForm}>Form Kunjungan</Text>
            <Formik
              initialValues={form}
              validationSchema={kunjunganFormSchema}
              onSubmit={async (values, {setSubmitting, resetForm}) => {
                this.setState((prevState) => ({
                  ...prevState,
                  form: {
                    ...prevState.form,
                    nama: values.nama,
                    tempat_lahir: values.tempat_lahir,
                    tgl_lahir: values.tgl_lahir,
                    agama: values.agama,
                    jk: values.jk,
                    email: values.email,
                    alamat: values.alamat,
                    created_by: this.props.data.id_user,
                  },
                }));
                try {
                  const status = await this.handleAddKunjungan();
                  if (status) {
                    this.handleSetContentFormData();
                    resetForm({
                      values: {
                        no_hp: '',
                        nama: '',
                        tempat_lahir: '',
                        tgl_lahir: '',
                        agama: '',
                        jk: '',
                        email: '',
                        alamat: '',
                      },
                    });
                    setSubmitting(false);
                  }
                } catch (error) {
                  Alert.alert('Terjadi kesalahan saat memuat ulang form');
                }
              }}>
              {(props) => (
                <View style={styles.cardForm}>
                  <View style={styles.cardNumber}>
                    <View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Nomor HP..."
                        keyboardType="phone-pad"
                        value={props.values.no_hp}
                        onChangeText={(value) => {
                          props.setFieldValue('no_hp', value);
                          this.setState((prevState) => ({
                            ...prevState,
                            form: {
                              ...prevState,
                              no_hp: value,
                            },
                          }));
                        }}
                      />
                      <Text style={styles.smallText}>
                        {props.errors.no_hp ? `${props.errors.no_hp}` : ''}
                      </Text>
                    </View>
                    <Button
                      color="#3960CF"
                      title="Cek Nomor"
                      disabled={
                        props.errors.no_hp || !this.state.isConnected
                          ? true
                          : false
                      }
                      style={styles.button}
                      onPress={this.handleCheckHP}
                    />
                    <Text style={styles.smallText}>
                      {this.handleSetNumInfo()}
                    </Text>
                  </View>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Nama..."
                    value={props.values.nama}
                    onChangeText={props.handleChange('nama')}
                    onBlur={props.handleBlur('nama')}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.nama ? `${props.errors.nama}` : ''}
                  </Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Tempat Lahir..."
                    value={props.values.tempat_lahir}
                    onChangeText={props.handleChange('tempat_lahir')}
                    onBlur={props.handleBlur('tempat_lahir')}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.tempat_lahir
                      ? `${props.errors.tempat_lahir}`
                      : ''}
                  </Text>

                  <View style={styles.dateContainer}>
                    <Text
                      style={styles.textInputDate}
                      onPress={() => {
                        this.setState((prevState) => ({
                          ...prevState,
                          show: true,
                        }));
                      }}>
                      {props.values.tgl_lahir === undefined ||
                      props.values.tgl_lahir === ''
                        ? 'Tanggal Lahir'
                        : `${props.values.tgl_lahir}`}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      color="red"
                      size={30}
                    />
                  </View>
                  <DateTimePickerModal
                    isVisible={show}
                    mode="date"
                    date={moment(props.values.tgl_lahir).toDate()}
                    onConfirm={(date) => {
                      props.setFieldValue(
                        'tgl_lahir',
                        moment(date).format('YYYY-MM-DD'),
                      );
                      this.setState((prevState) => ({
                        ...prevState,
                        show: false,
                      }));
                    }}
                    onCancel={() => {
                      this.setState((prevState) => ({
                        ...prevState,
                        show: false,
                      }));
                    }}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.tgl_lahir ? `${props.errors.tgl_lahir}` : ''}
                  </Text>

                  <RNPickerSelect
                    onValueChange={(value) => {
                      props.setFieldValue('agama', value);
                    }}
                    value={props.values.agama}
                    placeholder={{
                      label: 'Pilih Agama',
                      value: '',
                      color: 'red',
                    }}
                    useNativeAndroidPickerStyle={false}
                    items={[
                      {label: 'Islam', value: 'Islam'},
                      {label: 'Katolik', value: 'Katolik'},
                      {label: 'Kristen', value: 'Kristen'},
                      {label: 'Hindu', value: 'Hindu'},
                      {label: 'Budha', value: 'Budha'},
                      {label: 'Konghucu', value: 'Konghucu'},
                      {label: 'Lain-lain', value: 'Lain-lain'},
                    ]}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.agama ? `${props.errors.agama}` : ''}
                  </Text>

                  <RNPickerSelect
                    onValueChange={(value) => {
                      props.setFieldValue('jk', value);
                    }}
                    value={props.values.jk}
                    placeholder={{
                      label: 'Pilih Jenis Kelamin',
                      value: '',
                      color: 'red',
                    }}
                    useNativeAndroidPickerStyle={false}
                    items={[
                      {label: 'Laki-laki', value: 'Laki-laki'},
                      {label: 'Perempuan', value: 'Perempuan'},
                    ]}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.jk ? `${props.errors.jk}` : ''}
                  </Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Email..."
                    keyboardType="email-address"
                    value={props.values.email}
                    onChangeText={props.handleChange('email')}
                    onBlur={props.handleBlur('email')}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.email ? `${props.errors.email}` : ''}
                  </Text>

                  <View>
                    <Text style={styles.styleForAddresFontLabel}>Alamat</Text>
                    <TextInput
                      style={styles.textArea}
                      multiline={true}
                      numberOfLines={10}
                      value={props.values.alamat}
                      onChangeText={props.handleChange('alamat')}
                      onBlur={props.handleBlur('alamat')}
                    />
                    <Text style={styles.smallText}>
                      {props.errors.alamat ? `${props.errors.alamat}` : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.buttonSelectFile}
                    activeOpacity={0.5}
                    onPress={this.handleSelectFile}>
                    <Text style={styles.buttonSelectFileText}>Pilih Foto</Text>
                  </TouchableOpacity>

                  <Button
                    color="#3960CF"
                    title="Simpan"
                    disabled={dataCheckNumber.btnSubmit}
                    style={styles.button}
                    onPress={props.handleSubmit}
                  />
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isConnected: state.isConnected,
    data: {
      id_user: state.data.id_user,
    },
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogout: () => dispatch({type: ActionType.IS_LOGOUT}),
    handleConnections: () => dispatch({type: ActionType.IS_CONNECTED}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Kunjungan);

const styles = StyleSheet.create({
  safeAreaStyle: {
    flex: 1,
    justifyContent: 'center',
  },
  appBar: {
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#466BD9',
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
  },
  styleForAddresFontLabel: {
    color: '#7f7f7f',
  },
  textArea: {
    height: 100,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  textInputDate: {
    width: '80%',
    color: 'lightgrey',
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  smallText: {
    fontSize: 11,
    color: 'red',
    margin: 0,
    padding: 1,
  },
  cardNumber: {
    marginBottom: 25,
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
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonSelectFile: {
    backgroundColor: '#307ecc',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonSelectFileText: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
});
