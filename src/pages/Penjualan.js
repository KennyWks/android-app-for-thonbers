import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {style} from 'styled-system';

class Penjualan extends Component {
  render() {
    return (
      <View style={styles.content}>
        <Text>Tab Penjualan</Text>
      </View>
    );
  }
}

export default Penjualan;

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#466BD9',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
