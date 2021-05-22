import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';

class Kunjungan extends Component {
  render() {
    return (
      <View style={styles.content}>
        <Text>Tab Kunjungan</Text>
      </View>
    );
  }
}

export default Kunjungan;

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#466BD9',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
