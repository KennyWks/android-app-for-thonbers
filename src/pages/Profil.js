import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, Alert} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {connect} from 'react-redux';
import {getData} from '../helpers/CRUD';
import ActionType from '../redux/reducer/globalActionType';
import Logo from '../assets/img/user.png';
import Spinner from '../components/SpinnerScreen';

class ProfilScreen extends Component {
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
      onLoad: false,
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

  componentDidUpdate() {
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
      const responseDataUser = await getData('/user_m/user/saler');
      this.setState((prevState) => ({
        ...prevState,
        detailUser: responseDataUser.data,
      }));
    } catch (error) {
      if (error.response.status !== 404) {
        const {msg} = error.response.data;
        Alert.alert(msg);
      } else {
        Alert.alert('Terjadi kesalahan!');
      }
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

  render() {
    const {detailUser, onLoad} = this.state;
    return (
      <View>
        <Spinner visible={onLoad} textContent="Memproses..." />
        {Object.keys(detailUser).length > 0 && (
          <View style={styles.content}>
            <View>
              <Text style={styles.profilCard}>
                Selamat datang {detailUser.data.name}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.detailProfilImageCard}>
                <Image source={Logo} style={styles.logo} />
              </View>
              <View style={styles.detailProfilCard}>
                <Text style={styles.text}>{detailUser.data.username}</Text>
                <Text style={styles.text}>{detailUser.data.hp}</Text>

                <View style={styles.buttonView}>
                  <Button
                    onPress={() => this.props.navigation.push('Ubah Profil')}
                    title="Ubah Profil"
                    color="#1CC88A"
                    accessibilityLabel="for update profil"
                  />
                  <Button
                    onPress={() => this.props.navigation.push('Ubah Password')}
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
    padding: 3,
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
  profilCard: {
    fontSize: 16,
    color: '#858796',
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 6,
  },
  detailProfilCard: {
    backgroundColor: '#fff',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailProfilImageCard: {
    backgroundColor: '#E7E7E7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
