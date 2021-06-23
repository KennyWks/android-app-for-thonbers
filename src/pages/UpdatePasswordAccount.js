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
import Spinner from 'react-native-loading-spinner-overlay';
import ActionType from '../redux/reducer/globalActionType';
import {connect} from 'react-redux';
import {postData} from '../helpers/CRUD';

class UpdatePasswordAccount extends Component {
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
      formUpdatePass: {
        oldPassword: '',
        password: '',
        repeatNewPassword: '',
      },
      onLoad: false,
      error: {
        oldPassword: '',
        password: '',
        repeatNewPassword: '',
      },
    };
  }

  componentDidMount() {
    const time = Math.floor(new Date().getTime() / 1000);
    const session = this.state.exp - this.state.iat;
    if (time - this.state.iat > session) {
      this.handleLogout();
    }
  }

  componentWillUnmount() {
    const time = Math.floor(new Date().getTime() / 1000);
    const session = this.state.exp - this.state.iat;
    if (time - this.state.iat > session) {
      this.handleLogout();
    }
  }

  handleUpdate = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onLoad: true,
      error: {
        ...prevState.error,
        oldPassword: '',
        password: '',
        repeatNewPassword: '',
      },
    }));
    try {
      const responseDataUser = await postData(
        '/user_m/saler/update/password',
        this.state.formUpdatePass,
      );
      this.setState((prevState) => ({
        ...prevState,
        formUpdatePass: {
          ...prevState.formUpdatePass,
          oldPassword: '',
          password: '',
          repeatNewPassword: '',
        },
      }));

      this.toastLogin(responseDataUser.data.msg);
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
    const {formUpdatePass} = this.state;
    return (
      <View style={styles.content}>
        <Spinner
          visible={this.state.onLoad}
          textContent={'Memuat...'}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.formUpdatePasswordCard}>
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

          <View style={styles.buttonUpdateImage}>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdatePasswordAccount);

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
  formUpdatePasswordCard: {
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '90%',
  },
  buttonUpdateImage: {
    marginTop: 5,
  },
});
