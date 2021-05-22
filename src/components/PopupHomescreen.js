import React from 'react';
import {View, Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';

class PopupHomescreen extends React.PureComponent {
  _menu = null;

  setMenuRef = (ref) => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  handleLogout = async () => {
    const asyncStorage = await AsyncStorage.removeItem('accessToken');
    setTimeout(() => {
      this.props.navigation.navigate('Login');
    }, 300);
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          height: '100%',
          flexDirection: 'row-reverse',
          alignItems: 'center',
          marginLeft: 10,
        }}>
        <Menu
          ref={this.setMenuRef}
          button={<Text onPress={this.showMenu}>Show menu</Text>}>
          <MenuItem onPress={this.hideMenu}>Profil saya</MenuItem>
          <MenuDivider />
          <MenuItem onPress={this.handleLogout}>Keluar</MenuItem>
        </Menu>
      </View>
    );
  }
}

export default PopupHomescreen;
