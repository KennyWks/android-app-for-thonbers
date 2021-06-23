import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ToastAndroid,
  Button,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNDatePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import GetLocation from 'react-native-get-location';
import {connect} from 'react-redux';
import ActionType from '../redux/reducer/globalActionType';
import {postData} from '../helpers/CRUD';
import {Formik} from 'formik';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Yup from 'yup';

const kunjunganFormSchema = Yup.object().shape({
  no_hp: Yup.string()
    .required('Nomor Hp wajib diisi!')
    .min(11, 'Nomor Hp minimal 11 karakter!')
    .max(12, 'Nomor Hp maksimal 12 karakter!'),
  nama: Yup.string().required('Nama wajib diisi!'),
  tempat_lahir: Yup.string().required('Tempat lahir wajib diisi!'),
  tgl_lahir: Yup.string().required('Tanggal lahir wajib diisi!'),
  agama: Yup.string().required('Agama wajib dipilih!'),
  jk: Yup.string().required('Jenis Kelamin wajib dipilih!'),
  email: Yup.string().email('Alamat email tidak valid!'),
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
        tgl_lahir: '',
        agama: '',
        jk: '',
        email: '',
        alamat: '',
        foto: '',
        created_by: props.data.id_user,
      },
      show: false,
      dataCheckNumber: {
        valid: '',
        carrier: '',
        btnSubmit: false,
      },
      onSubmit: false,
      isConnected: props.isConnected,
    };
  }

  componentDidMount() {
    this.getLocation();
    this.props.handleConnections();
  }

  getLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 25000,
    })
      .then((location) => {
        this.setState((prevState) => ({
          ...prevState,
          form: {
            ...prevState.form,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }));
      })
      .catch((error) => {
        const {code} = error;
        if (code === 'CANCELLED') {
          Alert.alert('Location cancelled by user or by another request');
        }
        if (code === 'UNAVAILABLE') {
          Alert.alert('Location service is disabled or unavailable');
        }
        if (code === 'TIMEOUT') {
          Alert.alert('Location request timed out');
        }
        if (code === 'UNAUTHORIZED') {
          Alert.alert('Authorization denied');
        }
      });
  };

  handleAddKunjungan = () => {
    const {foto, longitude, latitude} = this.state.form;
    if (longitude && latitude) {
      if (foto) {
        if (this.state.isConnected) {
          this.handleAddKunjunganOnlineMode();
        } else {
          this.handleAddKunjunganOfflineMode();
        }
      } else {
        Alert.alert('Anda belum memilih foto!');
      }
    } else {
      Alert.alert('Lokasi anda tidak valid! Coba lagi.');
      this.props.handleConnections();
    }
  };

  handleSetContentFormData = (params) => {
    if (params === true) {
      const {form} = this.state;
      let formData = new FormData();
      formData.append('latitude ', form.latitude);
      formData.append('longitude ', form.longitude);
      formData.append('no_hp ', form.no_hp);
      formData.append('nama ', form.nama);
      formData.append('tempat_lahir ', form.tempat_lahir);
      formData.append('tgl_lahir ', form.tgl_lahir);
      formData.append('agama ', form.agama);
      formData.append('jk ', form.jk);
      formData.append('email ', form.email);
      formData.append('alamat ', form.alamat);
      formData.append('foto ', form.foto);
      formData.append('created_by ', form.created_by);
      return formData;
    } else {
      this.setState((prevState) => ({
        ...prevState,
        form: {
          ...prevState.form,
          latitude: '',
          longitude: '',
          no_hp: '',
          nama: '',
          tempat_lahir: '',
          tgl_lahir: '',
          agama: '',
          jk: '',
          email: '',
          alamat: '',
          foto: '',
        },
      }));
    }
  };

  handleAddKunjunganOnlineMode = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onSubmit: true,
    }));
    const formData = this.handleSetContentFormData(true);
    try {
      const response = await postData(
        '/user_m/kunjungan/add/customer',
        formData,
      );
      console.log(response);
      if (response.data.data) {
        await this.handleSetContentFormData(false);
        this.toastMessage(response.data.msg);
      } else {
        this.toastMessage(response.data.msg);
      }
    } catch (error) {
      Alert.alert('Error! silahkan coba lagi.');
      console.log(error.response);
    }
    this.setState((prevState) => ({
      ...prevState,
      onSubmit: false,
    }));
  };

  handleAddKunjunganOfflineMode = () => {
    console.log('offline');
  };

  toastMessage = (message) => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );
  };

  setSingleFile = (params) => {
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
      this.setSingleFile(res);
    } catch (err) {
      this.setSingleFile(null);
      // Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        // If user canceled the document selection
        Alert.alert('Upload dibatalkan');
      } else {
        // For Unknown Error
        Alert.alert('Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  };

  handleCheckNumber = async () => {
    const {no_hp} = this.state.form;
    if (no_hp !== '') {
      this.setState((prevState) => ({
        ...prevState,
        onSubmit: true,
      }));

      this.setState((prevState) => ({
        ...prevState,
        dataCheckNumber: {
          ...prevState.dataCheckNumber,
          valid: '',
          carrier: '',
          btnSubmit: false,
        },
      }));

      let formData = new FormData();
      formData.append('no_hp', no_hp);
      try {
        const response = await postData(
          '/user_m/kunjungan/check/customer/nohp',
          formData,
        );
        const data = response.data;
        this.setState((prevState) => ({
          ...prevState,
          dataCheckNumber: {
            ...prevState.dataCheckNumber,
            valid: data.valid,
            carrier: data.carrier,
            btnSubmit: data.valid === 'exists' ? true : false,
          },
        }));
      } catch (error) {
        Alert.alert('Error! silahkan coba lagi.');
      }
      this.setState((prevState) => ({
        ...prevState,
        onSubmit: false,
      }));
    } else {
      Alert.alert('Nomor Hp  wajib diisi!');
    }
  };

  handledetNumInfo = () => {
    const {dataCheckNumber} = this.state;
    let numInfo = '';
    if (dataCheckNumber.valid === true) {
      numInfo = 'Nomor ini aktif.';
    } else if (dataCheckNumber.valid === 'exists') {
      numInfo = 'Nomor sudah ada di dalam sistem.';
    } else {
      numInfo = '';
    }
    return numInfo;
  };

  render() {
    const {form, show, dataCheckNumber} = this.state;
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.content}>
            <Spinner
              visible={this.state.onSubmit}
              textContent={'Memproses...'}
              textStyle={styles.spinnerTextStyle}
            />
            <Text style={styles.titleForm}>Form Kunjungan</Text>

            <Formik
              initialValues={form}
              validationSchema={kunjunganFormSchema}
              onSubmit={(values) => {
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
                  },
                }));
                this.handleAddKunjungan();
              }}>
              {(props) => (
                <View style={styles.cardForm}>
                  <View style={styles.cardNumber}>
                    <View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Nomor HP..."
                        keyboardType="phone-pad"
                        value={props.no_hp}
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
                      onPress={this.handleCheckNumber}
                    />
                    <Text style={styles.smallText}>
                      {this.handledetNumInfo()}
                    </Text>
                  </View>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Nama..."
                    value={props.nama}
                    onChangeText={props.handleChange('nama')}
                    onBlur={props.handleBlur('nama')}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.nama ? `${props.errors.nama}` : ''}
                  </Text>

                  <TextInput
                    style={styles.textInput}
                    placeholder="Tempat Lahir..."
                    value={props.tempat_lahir}
                    onChangeText={props.handleChange('tempat_lahir')}
                    onBlur={props.handleBlur('tempat_lahir')}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.tempat_lahir
                      ? `${props.errors.tempat_lahir}`
                      : ''}
                  </Text>

                  <View style={styles.dateContainer}>
                    <TextInput
                      style={styles.textInputDate}
                      placeholder="Tanggal Lahir..."
                      value={
                        props.values.tgl_lahir !== undefined
                          ? `${props.values.tgl_lahir}`
                          : ''
                      }
                      editable={false}
                    />
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      color="red"
                      size={30}
                      onPress={() => {
                        this.setState((prevState) => ({
                          ...prevState,
                          show: true,
                        }));
                      }}
                    />
                  </View>
                  {show && (
                    <RNDatePicker
                      testID="datePicker"
                      value={new Date(1950, 1, 1)}
                      mode="date"
                      minimumDate={new Date(1950, 1, 1)}
                      maximumDate={new Date(2022, 1, 1)}
                      is24Hour={true}
                      display="default"
                      onChange={(value) => {
                        const date = new Date(value.nativeEvent.timestamp)
                          .toISOString()
                          .slice(0, 10)
                          .replace('T', ' ');
                        props.setFieldValue('tgl_lahir', date);
                        this.setState((prevState) => ({
                          ...prevState,
                          show: false,
                        }));
                      }}
                    />
                  )}
                  <Text style={styles.smallText}>
                    {props.errors.tgl_lahir ? `${props.errors.tgl_lahir}` : ''}
                  </Text>

                  <RNPickerSelect
                    onValueChange={(value) => {
                      props.setFieldValue('agama', value);
                    }}
                    value={props.agama}
                    placeholder={{
                      label: 'Pilih Agama',
                      value: null,
                      color: 'red',
                    }}
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
                    value={props.jk}
                    placeholder={{
                      label: 'Pilih Jenis Kelamin',
                      value: null,
                      color: 'red',
                    }}
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
                    value={props.email}
                    onChangeText={props.handleChange('email')}
                    onBlur={props.handleBlur('email')}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.email ? `${props.errors.email}` : ''}
                  </Text>

                  <TextInput
                    style={styles.textInput}
                    multiline={true}
                    numberOfLines={10}
                    placeholder="Alamat..."
                    value={props.alamat}
                    onChangeText={props.handleChange('alamat')}
                    onBlur={props.handleBlur('alamat')}
                  />
                  <Text style={styles.smallText}>
                    {props.errors.alamat ? `${props.errors.alamat}` : ''}
                  </Text>

                  <TouchableOpacity
                    style={styles.buttonSelectFile}
                    activeOpacity={0.5}
                    onPress={this.handleSelectFile}>
                    <Text style={styles.buttonTextStyle}>Select File</Text>
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
      </View>
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
    handleConnections: () => dispatch({type: ActionType.IS_CONNECTED}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Kunjungan);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    margin: 2,
    padding: 2,
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
  textInputDate: {
    height: 45,
    width: '75%',
    backgroundColor: '#fff',
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
  spinnerTextStyle: {
    color: '#FFF',
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
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
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
});
