import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  ToastAndroid,
  Text,
  Alert,
} from 'react-native';
import ActionType from '../redux/reducer/globalActionType';
import Spinner from 'react-native-loading-spinner-overlay';
import {connect} from 'react-redux';
import {getData, postData} from '../helpers/CRUD';

class UpdateProfil extends Component {
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
      detailUser: {},
      formUpdateProfil: {
        name: '',
        hp: '',
      },
      onLoad: false,
      error: {
        name: '',
        hp: '',
      },
    };
  }

  componentDidMount() {
    const time = Math.floor(new Date().getTime() / 1000);
    const session = this.state.exp - this.state.iat;
    if (time - this.state.iat > session) {
      this.handleLogout();
    } else {
      this.getDataUser();
    }
  }

  componentWillUnmount() {
    const time = Math.floor(new Date().getTime() / 1000);
    const session = this.state.exp - this.state.iat;
    if (time - this.state.iat > session) {
      this.handleLogout();
    }
  }

  getDataUser = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onLoad: true,
    }));
    try {
      const responseDataUser = await getData('/user_m/saler');
      this.setState((prevState) => ({
        ...prevState,
        formUpdateProfil: {
          ...prevState.formUpdateProfil,
          name: responseDataUser.data.data.name,
          hp: responseDataUser.data.data.hp,
        },
      }));
    } catch (error) {
      Alert.alert(error);
    }
    this.setState((prevState) => ({
      ...prevState,
      onLoad: false,
    }));
  };

  handleLogout = async () => {
    this.props.handleLogout();
    setTimeout(() => {
      this.props.navigation.navigate('Login');
    }, Alert.alert('Sesi anda telah berakhir, silahkan login kembali'));
  };

  handleUpdate = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onLoad: true,
    }));
    try {
      const responseDataUser = await postData(
        '/user_m/saler/update/profil',
        this.state.formUpdateProfil,
      );
      this.getDataUser();
      this.toastLogin(responseDataUser.data.msg);
    } catch (error) {
      if (error.response.status === 500) {
        const {msg} = error.response.data;
        if (msg !== undefined) {
          this.setState((prevState) => ({
            ...prevState,
            error: {
              ...prevState.error,
              name: `${msg.name}`,
              hp: `${msg.hp}`,
            },
          }));
        }
      } else {
        Alert.alert(error);
      }
    }
    this.setState((prevState) => ({
      ...prevState,
      onLoad: false,
    }));
  };

  toastLogin = (message) => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );
  };

  render() {
    const {formUpdateProfil} = this.state;
    return (
      <View style={styles.content}>
        <Spinner
          visible={this.state.onLoad}
          textContent={'Memuat...'}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.formUpdateProfil}>
          <TextInput
            style={styles.textInput}
            placeholder="Nama..."
            value={formUpdateProfil.name}
            onChangeText={(text) =>
              this.setState((prevState) => ({
                ...prevState,
                formUpdateProfil: {
                  ...prevState.formUpdateProfil,
                  name: text,
                },
              }))
            }
          />
          <Text style={styles.smallText}>
            {this.state.error.name !== 'undefined'
              ? `${this.state.error.name}`
              : ''}
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="Nomor HP..."
            value={formUpdateProfil.hp}
            onChangeText={(text) =>
              this.setState((prevState) => ({
                ...prevState,
                formUpdateProfil: {
                  ...prevState.formUpdateProfil,
                  hp: text,
                },
              }))
            }
          />
          <Text style={styles.smallText}>
            {this.state.error.hp !== 'undefined'
              ? `${this.state.error.hp}`
              : ''}
          </Text>

          <View style={styles.buttonUpdateView}>
            <Button
              color="#1CC88A"
              title="Ubah"
              style={styles.button}
              onPress={this.handleUpdate}
            />
          </View>
        </View>
      </View>
    );
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(UpdateProfil);

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#fff',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  textInput: {
    height: 45,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: 'gray',
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
  button: {
    height: '18%',
    width: 240,
    borderRadius: 5,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  formUpdateProfil: {
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '90%',
  },
  buttonUpdateView: {
    marginTop: 5,
  },
});
