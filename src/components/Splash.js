import React, {Component} from 'react';
import {StyleSheet, View, Image} from 'react-native';
import Logo from '../assets/img/logo.png';

export default class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {timer: 0};
    setInterval(() => {
      this.setState({timer: this.state.timer + 1});
    }, 1000);
  }
  render() {
    return (
      <View style={styles.container}>
        <Image source={Logo} style={styles.logo} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#466BD9',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
