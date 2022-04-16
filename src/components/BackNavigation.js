import React from 'react';
import {TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BackNavigation = (props) => {
  return (
    <TouchableOpacity style={{margin: 10}}>
      <MaterialCommunityIcons
        name="arrow-left-thick"
        activeOpacity={0.5}
        size={20}
        color="white"
        onPress={() => {
          props.navigation.push(props.page);
        }}
      />
    </TouchableOpacity>
  );
};

export default BackNavigation;
