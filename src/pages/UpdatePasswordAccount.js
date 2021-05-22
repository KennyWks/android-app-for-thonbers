import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  ToastAndroid,
  Text,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import ActionType from '../redux/reducer/globalActionType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import {connect} from 'react-redux';
import {postData} from '../helpers/CRUD';

class UpdatePasswordAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: true,
      data: {
        id_user: false,
        email: false,
        role_id: false,
      },
      exp: 0,
      iat: 0,
      formUpdatePass: {
        oldPassword: '',
        password: '',
        repeatNewPassword: '',
      },
      onLoad: false,
      message: false,
      error: {
        oldPassword: '',
        password: '',
        repeatNewPassword: '',
      },
    };
  }

  componentDidMount() {
    this.getDataToken();
    setTimeout(() => {
      const time = Math.floor(new Date().getTime() / 1000);
      const session = this.state.exp - this.state.iat;
      if (time - this.state.iat > session) {
        this.handleLogout();
      }
    }, 150);
  }

  componentWillUnmount() {
    setTimeout(() => {
      const time = Math.floor(new Date().getTime() / 1000);
      const session = this.state.exp - this.state.iat;
      if (time - this.state.iat > session) {
        this.handleLogout();
      }
    }, 150);
  }

  getDataToken = async () => {
    const asyncStorage = await AsyncStorage.getItem('accessToken');
    const token = jwtDecode(asyncStorage);
    this.setState((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        id: token.data.id,
        email: token.data.email,
        role_id: token.data.role_id,
      },
      exp: token.exp,
      iat: token.iat,
    }));
  };

  handleUpdate = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onLoad: true,
    }));
    try {
      const responseDataUser = await postData(
        `/user_m/saler/update/password`,
        this.state.formUpdatePass,
      );
      this.setState((prevState) => ({
        ...prevState,
        message: responseDataUser.data.msg,
      }));
      this.toastLogin();
    } catch (error) {
      if (error.response.status === 500) {
        const {msg} = error.response.data;
        if (msg !== undefined) {
          const oldPassword = msg.oldPassword ? msg.oldPassword : '';
          const password = msg.password ? msg.password : '';
          const repeatNewPassword = msg.repeatNewPassword
            ? msg.repeatNewPassword
            : '';
          this.setState((prevState) => ({
            ...prevState,
            error: {
              ...prevState.error,
              oldPassword: `${oldPassword}`,
              password: `${password}`,
              repeatNewPassword: `${repeatNewPassword}`,
            },
          }));
        }
      } else {
        alert(error);
      }
    }
    this.setState((prevState) => ({
      ...prevState,
      onLoad: false,
    }));
  };

  toastLogin = () => {
    ToastAndroid.showWithGravity(
      this.state.message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );
  };

  render() {
    const {formUpdatePass} = this.state;
    return (
      <View style={styles.content}>
        <Spinner
          visible={this.state.onLoad}
          textContent={'Memuat...'}
          textStyle={styles.spinnerTextStyle}
        />
        <View
          style={{
            padding: 10,
            borderRadius: 5,
            marginTop: 5,
            width: '90%',
          }}>
          <TextInput
            style={styles.textInput}
            placeholder="Password Anda..."
            value={formUpdatePass.oldPassword}
            secureTextEntry={true}
            onChangeText={(text) =>
              this.setState((prevState) => ({
                ...prevState,
                formUpdatePass: {
                  ...prevState.formUpdatePass,
                  oldPassword: text,
                },
              }))
            }
          />
          <Text style={styles.smallText}>
            {this.state.error.oldPassword !== 'undefined'
              ? `${this.state.error.oldPassword}`
              : ''}
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="Password Baru..."
            value={formUpdatePass.password}
            secureTextEntry={true}
            onChangeText={(text) =>
              this.setState((prevState) => ({
                ...prevState,
                formUpdatePass: {
                  ...prevState.formUpdatePass,
                  password: text,
                },
              }))
            }
          />
          <Text style={styles.smallText}>
            {this.state.error.password !== 'undefined'
              ? `${this.state.error.password}`
              : ''}
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="Konfirmasi Password Baru..."
            value={formUpdatePass.repeatNewPassword}
            secureTextEntry={true}
            onChangeText={(text) =>
              this.setState((prevState) => ({
                ...prevState,
                formUpdatePass: {
                  ...prevState.formUpdatePass,
                  repeatNewPassword: text,
                },
              }))
            }
          />
          <Text style={styles.smallText}>
            {this.state.error.repeatNewPassword !== 'undefined'
              ? `${this.state.error.repeatNewPassword}`
              : ''}
          </Text>

          <View
            style={{
              marginTop: 5,
            }}>
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogout: () => dispatch({type: ActionType.IS_LOGOUT}),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdatePasswordAccount);

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#466BD9',
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
});
