import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

export const Popup = () => (
  <View style={styles.popupUser}>
    <Menu>
      <MenuTrigger text="Profil" />
      <MenuOptions>
        <MenuOption onSelect={() => alert(`Your profile`)} text="Profil" />
        <MenuOption onSelect={() => alert(`Your logut`)}>
          <Text style={{color: 'red'}}>Keluar</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  </View>
);

const styles = StyleSheet.create({
  popupUser: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
});
