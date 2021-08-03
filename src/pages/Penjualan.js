import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';

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
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
