import React from 'react';
import {View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BackNavigation = (props) => {
  return (
    <View style={{margin: 10}}>
      <MaterialCommunityIcons
        name="arrow-left-thick"
        size={20}
        onPress={() => {
          props.navigation.push(props.page);
        }}
      />
    </View>
  );
};

export default BackNavigation;
