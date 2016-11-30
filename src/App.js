/*eslint no-unused-vars: "off"*/ //don't show warnings for unused
import React, { Component } from 'react';
import {Row, Col} from 'react-materialize';
import {RaisedButton, FlatButton, Dialog, TextField, List, ListItem, AppBar} from 'material-ui';
import _ from 'lodash';
import Search from './Search';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const ytURL = 'https://www.youtube.com/watch?v=';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: []
    };
    this.searchCallback = this.searchCallback.bind(this);
    this.handleSearchSelect = this.handleSearchSelect.bind(this);
  }

  handleSearchSelect = elem => {
    console.log(ytURL + elem);
  }

  searchCallback = results => {
    console.log(results);
    let content = _.map(results, elem => {
      return <ListItem
        onTouchTap={() => this.handleSearchSelect(elem.id.videoId)}
        style={{overflow: 'hidden'}}
        innerDivStyle={{padding: '0', margin: '10px 10px 0px 0px',}}
        key={elem.id.videoId}
        leftAvatar={<img className="responsive-img" style={{position: 'none', float: 'left', marginRight: '10px'}} src={elem.snippet.thumbnails.default.url} alt={elem.id.videoId}/>}
        primaryText={<div style={{paddingTop: '20px'}}>{elem.snippet.title}</div>}
        secondaryText={elem.snippet.description}
      />
    });
    this.setState({searchResults: content});
  }



  render() {
    return (
      <div>
        <header>
          <MuiThemeProvider muiTheme={getMuiTheme()}>
          <AppBar title="Title"/>
        </MuiThemeProvider>
        </header>
        <main className="container">
          <Row>
            <Col s={12} m={12} l={6}>
              <Col s={12}>
                <h1 className="center-align">Search</h1>
                <Search
                  apiKey='AIzaSyAtSE-0lZOKunNlkHt8wDJk9w4GjFL9Fu4'
                  callback={this.searchCallback} />
              </Col>
              <Col s={12}>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                  <List style={{height: '600px', overflowY:'auto'}}>
                    {this.state.searchResults}
                  </List>
                </MuiThemeProvider>
              </Col>
            </Col>
          </Row>
        </main>
        <footer>

        </footer>
      </div>
    );
  }
}

export default App;
