import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TextInput,
  View,
  Button,
  Text,
  Alert,
} from 'react-native';
import ActionType from '../redux/reducer/globalActionType';
import {connect} from 'react-redux';
import Spinner from '../components/SpinnerScreen';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {postData} from '../helpers/CRUD';
import Logo from '../assets/img/user.png';
import {style} from 'styled-system';
import {toastMessage} from '../components/Toast';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: props.isLogin,
      form: {
        username: '',
        password: '',
      },
      error: {
        username: '',
        password: '',
      },
      onSubmit: false,
    };
  }

  componentDidMount() {
    if (this.state.isLogin) {
      this.props.navigation.push('Home');
    }
  }

  handleLogin = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onSubmit: true,
      error: {
        ...prevState.error,
        username: '',
        password: '',
      },
    }));

    let formData = new FormData();
    formData.append('username', this.state.form.username);
    formData.append('password', this.state.form.password);
    try {
      const response = await postData('/auth_m/login', formData);
      console.log(response);
      this.setState((prevState) => ({
        ...prevState,
        form: {
          username: '',
          password: '',
        },
      }));

      await AsyncStorage.setItem('accessToken', response.data.data);

      this.props.handleLogin();
      toastMessage(response.data.msg);
      this.redirectPage();
    } catch (error) {
      if (error.response.status !== 404) {
        const {msg} = error.response.data;
        if (msg.username || msg.password) {
          this.setState((prevState) => ({
            ...prevState,
            error: {
              ...prevState.error,
              username: `${msg.username}`,
              password: `${msg.password}`,
            },
          }));
        } else {
          Alert.alert(msg);
        }
      } else {
        Alert.alert('Something error!');
      }
    }
    this.setState((prevState) => ({
      ...prevState,
      onSubmit: false,
    }));
  };

  handleMasuk = () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.handleLogin();
      } else {
        Alert.alert('Anda sedang offline!');
      }
    });
  };

  redirectPage = () => {
    setTimeout(() => {
      this.props.navigation.push('Home');
    }, 150);
  };

  render() {
    return (
      <View style={styles.container}>
        <Spinner visible={this.state.onSubmit} textContent="Memproses..." />
        <View>
          <Image source={Logo} style={styles.logo} />
        </View>
        <View style={styles.formSigninCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Username..."
            value={this.state.form.username}
            onChangeText={(text) =>
              this.setState((prevState) => ({
                ...prevState,
                form: {
                  ...prevState.form,
                  username: text,
                },
              }))
            }
          />
          <Text style={styles.smallText}>
            {this.state.error.username !== 'undefined'
              ? `${this.state.error.username}`
              : ''}
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="Password..."
            value={this.state.form.password}
            secureTextEntry={true}
            onChangeText={(text) =>
              this.setState((prevState) => ({
                ...prevState,
                form: {
                  ...prevState.form,
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

          <View style={style.buttonSigninView}>
            <Button
              color="#466BD9"
              title="Masuk"
              style={styles.button}
              onPress={this.handleMasuk}
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
    handleLogin: () => dispatch({type: ActionType.IS_LOGIN}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#466BD9',
  },
  logo: {
    width: 90,
    height: 90,
    borderColor: '#d2f3f7',
    borderWidth: 2,
    borderRadius: 50,
    marginBottom: 30,
  },
  textInput: {
    height: 45,
    width: 240,
    paddingLeft: 10,
    backgroundColor: '#e3f7fa',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    letterSpacing: 2,
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
  formSigninCard: {
    backgroundColor: '#FFF',
    padding: 13,
    borderRadius: 5,
  },
  buttonSigninView: {
    marginTop: 5,
  },
});
