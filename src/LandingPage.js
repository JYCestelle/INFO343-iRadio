/*eslint no-unused-vars: "off"*/ //don't show warnings for unused
import React from 'react';
import firebase from 'firebase';
import {Row, Col} from 'react-materialize';
import {AppBar, FlatButton, Tabs, Tab, RaisedButton, Dialog, TextField} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import {Link, hashHistory} from 'react-router';
import SignInForm from './SignIn.js';
import SignUpForm from './SignUp.js'

//This component will need an auth listener; if the user is authed, then they shouldn't see sign in or sign up options, but create or join rooms.

class LandingPage extends React.Component {
  state = {
    signin: true,
    open: false,
    createDialog: false,
    roomName: '',
    userEmail: null,
    userID: null,
    roomMade: false
  }

  componentDidMount() {
  /* Add a listener and callback for authentication events */
  this.auth = firebase.auth().onAuthStateChanged(user => {
    if(user) {
      this.setState({userID:user.uid});
      this.setState({userEmail:user.email})
      //Check to see if they have made a room already
      firebase.database().ref('channels/jeff').once('value').then(snapshot => {
        if(snapshot.val().owner) {
          this.setState({roomMade: true})
        }
      });

    }
    else{
      this.setState({userID: null}); //null out the saved state
    }
  })
}

componentWillUnmount() {
  //Remove auth listener upon changing routes
    this.auth();
  }

  handleTap = () => {
    let currentState = this.state.signin;
    this.setState({signin: !currentState});
  }

  handleChange = event => {
    var value = event.target.value;
    this.setState({roomName:value});
  }

  handleClose = () => {
    this.setState({open: false});
  };

  handleOpen = isCreate => {
    //If true, that means create Room was selected
    if(isCreate) {
      this.setState({createDialog: true});
    } else {
      this.setState({createDialog: false});
    }
    this.setState({open: true});
  }

  handleJoinOwnRoom = () => {
    hashHistory.push('room/jeff');
  }

  handleAction = () => {
    this.handleClose();
    //if creating, init room. Dummy data is inserted for now. Else, join the given room
    if(this.state.createDialog) {
      let roomRef = firebase.database().ref('channels/jeff');
      roomRef.set({
        listeners: {},
        nowPlaying: {
          title: 'Shelter',
          channel: 'Porter Robinson',
          url: 'https://www.youtube.com/watch?v=fzQ6gRAEoy0',
          thumbnail: 'https://i.ytimg.com/vi/fzQ6gRAEoy0/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=RXcJaXW829FSP-JrIe8E6MTKHa4'
        },
        queue: {},
        history: {},
        owner: 'jeff'
      })
      roomRef.off();
      this.auth();
      hashHistory.push('room/jeff');
    } else {
      //Need to run a check if room exists here.
      hashHistory.push('room/' + this.state.roomName);
    }

  }

  render() {

    const actions = [
    <FlatButton
        label="Cancel"
        onTouchTap={this.handleClose}
    />,
    <FlatButton
        label={this.state.createDialog ? "Create Room" : "Join Room"}
        onTouchTap={this.handleAction}
    />]

    let content = null;
    if(firebase.auth().currentUser) {
      content = <div>
        <Row className="center-align">
          <br/>
          <Col s={12}>
            {this.state.roomMade && <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton labelStyle={{color:'#fff'}} primary={true} style={{marginRight: '10px'}} label="Enter Created Room" onTouchTap={this.handleJoinOwnRoom}/>
            </MuiThemeProvider>}
            {!this.state.roomMade && <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton labelStyle={{color:'#fff'}} primary={true} style={{marginRight: '10px'}} label="Create Room" onTouchTap={() => {this.handleOpen(true)}}/>
            </MuiThemeProvider>}
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton labelStyle={{color:'#fff'}} secondary={true} label="Join Room" onTouchTap={() => {this.handleOpen(false)}}/>
            </MuiThemeProvider>
          </Col>
        </Row>
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
           <Dialog
           title={'Create Your Room'.toUpperCase()}
           actions={actions}
           modal={false}
           open={this.state.open}>
           {this.state.createDialog ? "Create a room to share music with friends!" : "Join a pre-existing friends room!"} <br/>
           {!this.state.createDialog && <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <TextField
                floatingLabelText="Room ID"
                id='joinroom-input'
                onChange={this.handleChange}
              />
              </MuiThemeProvider>}
           </Dialog>
         </MuiThemeProvider>
      </div>
    } else {
      content = <Row>
        <Col s={12}>
          <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
            <RaisedButton label={this.state.signin ? "Go to Sign Up" : "Go to Sign In"} onTouchTap={this.handleTap}/>
          </MuiThemeProvider>
        </Col>
        <Col s={12}>
          {this.state.signin ? <SignInForm/> : <SignUpForm/>}
        </Col>
        <Col s={12}>
          <p>Continue as guest</p>
        </Col>
      </Row>
    }

    return (
      <div>
        {content}
      </div>
    );
  }
}

export default LandingPage;