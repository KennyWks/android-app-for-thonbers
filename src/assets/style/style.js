import {StyleSheet} from 'react-native';

const Style = StyleSheet.create({
  backGround: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wrapper: {
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: 'white',
    backgroundColor: 'green',
    borderRadius: 50,
    padding: 5,
    width: 40,
    height: 24,
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default Style;
