/*eslint no-unused-vars: "off"*/ //don't show warnings for unused
import React from 'react';
import firebase from 'firebase';
import {Row, Col} from 'react-materialize';
import {AppBar, FlatButton, Tabs, Tab, RaisedButton, Dialog, TextField, Avatar} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import {Link, hashHistory} from 'react-router';
import SignInForm from './SignIn.js';
import SignUpForm from './SignUp.js'


class LandingPage extends React.Component {
  state = {
    signin: true,
    open: false,
    createDialog: false,
    roomName: '',
    errorText: '',
    userEmail: 'init',
    userID: 'init',
    userHandle: '',
    roomMade: null,
  }

  componentDidMount() {
  /* Add a listener and callback for authentication events */
  this.auth = firebase.auth().onAuthStateChanged(user => {
    if(user) {
      this.setState({userID:user.uid});
      this.setState({userEmail:user.email})
      //Check to see if they have made a room already
      firebase.database().ref('users/' + user.uid).once('value').then(snapshot=> {
        if(snapshot.val()) {
          this.setState({userHandle: snapshot.val().handle})
          firebase.database().ref('channels/' + snapshot.val().handle).once('value').then(snapshot => {
            if(snapshot.val()) {
              this.setState({roomMade: true})
            } else {
              this.setState({roomMade: false})
            }
          });
        }
      });
    }
    else{
      this.setState({userID: null}); //null out the saved state
      this.setState({userEmail: null})
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
    if(this.state.errorText !== '') {
      this.setState({errorText: ''});
    }
  }

  handleClose = () => {
    this.setState({open: false});
    this.setState({errorText: ''})
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
    //Get user handle, and join the room
    hashHistory.push('room/jeff');
  }

  handleAction = () => {
    //if creating, init room. Acquire user handle
    if(this.state.createDialog) {
      let roomRef = firebase.database().ref('channels/' + this.state.userHandle);
      roomRef.set({
        listeners: {},
        nowPlaying: {},
        queue: {},
        history: {},
        owner: this.state.userHandle
      })
      roomRef.off();
      this.auth();
      this.handleClose();
      hashHistory.push('room/' + this.state.userHandle);
    } else {
      //Need to run a check if room exists here.
      let roomRef = firebase.database().ref('/channels/' + this.state.roomName).once('value').then(snapshot => {
        if(snapshot.val()) {
          //True, means the room exists
          hashHistory.push('room/' + this.state.roomName);
        } else {
          this.setState({errorText: 'Room "' + this.state.roomName + '" was not found'});
        }
      });
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
            {this.state.roomMade === true && <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton labelStyle={{color:'#fff'}} primary={true} style={{marginRight: '10px'}} label="Enter Created Room" onTouchTap={this.handleJoinOwnRoom}/>
            </MuiThemeProvider>}
            {this.state.roomMade === false && <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton labelStyle={{color:'#fff'}} primary={true} style={{marginRight: '10px'}} label="Create Room" onTouchTap={() => {this.handleOpen(true)}}/>
            </MuiThemeProvider>}
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton labelStyle={{color:'#fff'}} secondary={true} label="Join Room" onTouchTap={() => {this.handleOpen(false)}}/>
            </MuiThemeProvider>
          </Col>
        </Row>
      </div>
    } else if(this.state.userID !== 'init') {
      content =  <div>
        <Row>
          <Col s={12}>
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton label={this.state.signin ? "Go to Sign Up" : "Go to Sign In"} onTouchTap={this.handleTap}/>
            </MuiThemeProvider>
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <RaisedButton labelStyle={{color:'#fff'}} secondary={true} label="Join Room" onTouchTap={() => {this.handleOpen(false)}}/>
            </MuiThemeProvider>
          </Col>
        </Row>
            {this.state.signin ? <SignInForm/> : <SignUpForm/>}
      </div>
    }

    return (
      <div className="container">
        {content}
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
           <Dialog
<<<<<<< HEAD
           title={this.state.createDialog ? 'Create Your Room'.toUpperCase() : 'Join a Room'.toUpperCase()}
=======
           title={this.state.createDialog ? 'Create Your Room'.toUpperCase() : 'Join A Room'.toUpperCase()}
>>>>>>> 1c9d2c8619c255847f99a2b3ee6c7731f066a657
           actions={actions}
           modal={false}
           open={this.state.open}>
           {this.state.createDialog ? "Create a room to share music with friends!" : "Join a pre-existing friends room!"} <br/>
           {!this.state.createDialog && <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
              <TextField
                floatingLabelText="Room ID"
                id='joinroom-input'
                onChange={this.handleChange}
                errorText={this.state.errorText}
              />
              </MuiThemeProvider>}
           </Dialog>
         </MuiThemeProvider>
      </div>
    );
  }
}

export default LandingPage;
