import React, {Component} from 'react';
import Splash from './src/components/Splash';
import Error from './src/components/Error';
import Navigation from './src/pages/Navigation';

// import {MenuProvider} from 'react-native-popup-menu';

import {Provider} from 'react-redux';
import {createStore} from 'redux';
import rootReducer from './src/redux/reducer/globalReducer';

const storeRedux = createStore(rootReducer);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: <Splash />,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (true) {
        this.setState({
          view: <Navigation />,
        });
      } else {
        this.setState({
          view: <Error />,
        });
      }
    }, 2000);
  }

  render() {
    return (
      <Provider store={storeRedux}>
        {/* <MenuProvider> */}
        {this.state.view}
        {/* </MenuProvider> */}
      </Provider>
    );
  }
}
