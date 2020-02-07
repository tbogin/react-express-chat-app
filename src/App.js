import React, {Component} from 'react';
import './App.scss';
import "typeface-roboto";

import Chat from "./components/Chat/Chat";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="row">
          <div className="col">
            <div><Chat /></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
