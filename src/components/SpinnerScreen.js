import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import {StyleSheet} from 'react-native';

const SpinnerScreen = (props) => (
  <Spinner
    visible={props.visible}
    textContent={`${props.textContent}`}
    textStyle={styles.spinnerTextStyle}
  />
);

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default SpinnerScreen;
