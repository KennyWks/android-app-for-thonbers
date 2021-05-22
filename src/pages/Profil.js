import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import Spinner from 'react-native-loading-spinner-overlay';
import {connect} from 'react-redux';
import {getData} from '../helpers/CRUD';
import ActionType from '../redux/reducer/globalActionType';
import Logo from '../assets/img/user.png';

class ProfilScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: props.isLogin,
      data: {
        id_user: false,
        email: false,
        role_id: false,
      },
      exp: 0,
      iat: 0,
      detailUser: {},
      onLoad: false,
    };
  }

  componentDidMount() {
    this.getDataToken();
    setTimeout(() => {
      const time = Math.floor(new Date().getTime() / 1000);
      const session = this.state.exp - this.state.iat;
      if (time - this.state.iat > session) {
        this.handleLogout();
      } else {
        this.getDataUser();
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

  getDataUser = async () => {
    this.setState((prevState) => ({
      ...prevState,
      onLoad: true,
    }));
    try {
      const responseDataUser = await getData(`/user_m/saler`);
      this.setState((prevState) => ({
        ...prevState,
        detailUser: responseDataUser.data,
      }));
    } catch (error) {
      alert(error);
    }
    this.setState((prevState) => ({
      ...prevState,
      onLoad: false,
    }));
  };

  handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    this.props.handleLogout();
    setTimeout(() => {
      this.props.navigation.navigate('Login');
    }, alert('Sesi anda telah berakhir, silahkan login kembali'));
  };

  render() {
    const {detailUser} = this.state;
    return (
      <View>
        <Spinner
          visible={this.state.onLoad}
          textContent={'Memuat data profil...'}
          textStyle={styles.spinnerTextStyle}
        />
        {Object.keys(detailUser).length > 0 && (
          <View style={styles.content}>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  color: '#858796',
                  lineHeight: 24,
                  fontWeight: '400',
                  marginBottom: 6,
                }}>
                Selamat datang {detailUser.data.name}
              </Text>
            </View>

            <View style={styles.card}>
              <View
                style={{
                  backgroundColor: '#E7E7E7',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}>
                <Image source={Logo} style={styles.logo} />
              </View>
              <View
                style={{
                  backgroundColor: '#fff',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={styles.text}>{detailUser.data.username}</Text>
                <Text style={styles.text}>{detailUser.data.hp}</Text>

                <View style={styles.buttonView}>
                  <Button
                    onPress={() =>
                      this.props.navigation.navigate('Update Profil')
                    }
                    title="Ubah Profil"
                    color="#1CC88A"
                    accessibilityLabel="for update profil"
                  />
                  <Button
                    onPress={() =>
                      this.props.navigation.navigate('Update Password')
                    }
                    title="Ubah Password"
                    color="#1CC88A"
                    accessibilityLabel="for update password"
                  />
                </View>
              </View>
            </View>

            <View style={styles.footerText}>
              <Text>
                <MaterialCommunityIcons name="copyright" />
                Thonbers Computer
              </Text>
            </View>
          </View>
        )}
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfilScreen);

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#fff',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 3,
    paddingRight: 3,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E3E6F0',
    overflow: 'hidden',
    shadowColor: '#d5d8de',
    shadowRadius: 10,
    shadowOpacity: 1,
    width: '100%',
  },
  logo: {
    borderWidth: 1,
    borderRadius: 100,
    margin: 5,
  },
  text: {
    margin: 5,
    color: '#858796',
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 10,
  },
  footerText: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
