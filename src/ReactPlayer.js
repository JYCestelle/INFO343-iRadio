import React from 'react';
import ReactPlayer from 'react-player';
import {Slider, BottomNavigation, BottomNavigationItem} from 'material-ui';
import 'font-awesome/css/font-awesome.css';
import firebase from 'firebase';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import ForwardIcon from 'material-ui/svg-icons/av/fast-forward';

//RadioPlayer componenet that has both the video container and the playback controls
class RadioPlayer extends React.Component {

  constructor(props) {
    super(props);
    this.state =
      {
        nowPlaying:{
          url: '',
          baseUrl: '',
          duration: 0,
          formattedDuration: '',
          title: '',
          thumbnail: '',
          channel: '',
          progress: 0,
          isPlaying: false
        },
        queue:{},
        volume: 0.75
      };
  }

  componentDidMount() {

    firebase.auth().onAuthStateChanged((user) =>  {
      if(user) {
        this.setState({user:user});
      }
    });

    var channelId = this.props.room;
    let refPath = "channels/" + channelId;

    let channelRef = firebase.database().ref(refPath);
    channelRef.on("value", (snapshot) => {
      var channelObject = snapshot.val();
      var newState = this.state;
      let queueInstance = channelObject.queue;
      if(queueInstance) {
        for(let track in queueInstance) {
          if(queueInstance.hasOwnProperty(track)) {
            queueInstance[track].key = track;
          }
        }
        newState.queue = queueInstance;
      }
      let nowPlayingInstance = channelObject.nowPlaying;



      newState.nowPlaying = nowPlayingInstance;
      this.setState(newState);
    })
  }

  //handles the playing and pausing of the video for the whole room. only admin should have control over thi
  handlePlayPauseClick = () => {
    //TODO toggle the classNames so that 'fa fa-pause' is the new classname
    var thisState = this.state.nowPlaying;
    thisState.isPlaying = !this.state.nowPlaying.isPlaying;
    var nowPlayingRef = firebase.database().ref("channels/" + this.props.room + "/nowPlaying");
    nowPlayingRef.set(thisState);
  };

  //handles the fast forwrd clicking and updates the firebase instance
  handleForwardClick = () => {
    var refPath = "channels/" + this.props.room;
    var queueRef = firebase.database().ref(refPath + "/queue");
    var historyRef = firebase.database().ref("channels/" + this.props.room + "/history");
    var nowPlayingRef = firebase.database().ref("channels/" + this.props.room + "/nowPlaying");

    var roomRef = firebase.database().ref(refPath);
    //save the old now playing object
    var oldTrack = {
      url: this.state.nowPlaying.url,
      baseUrl: this.state.nowPlaying.url,
      duration: this.state.nowPlaying.duration,
      formattedDuration: this.state.nowPlaying.formattedDuration,
      title: this.state.nowPlaying.title,
      thumbnail: this.state.nowPlaying.thumbnail,
      channel: this.state.nowPlaying.channel,
    };
    historyRef.push(oldTrack);

    //get the object at the front of the queue
    var newTrack = null;
    queueRef.orderByKey().limitToFirst(1)
      .once("value", (snapshot) => {
        var newTrackContainer = snapshot.val();
        if(newTrackContainer) {
          for (var track in newTrackContainer) {
            if (newTrackContainer.hasOwnProperty(track)) {
              newTrack = newTrackContainer[track];
              newTrack.key = track;
            }
          }
        }
      });

    if(newTrack) {
      firebase.database().ref(refPath + "/queue/" + newTrack.key).remove();
    }
    //removes the song that was at the front of the queue
    var newQueue = {};
    queueRef.once("value", (snapshot) => {
      newQueue = snapshot.val();
    });
    //update the new now playing object entry
    var newNowPlaying = null;
    if(newTrack) {
      newNowPlaying = {
        url: newTrack.url,
          baseUrl: newTrack.url,
        duration: newTrack.duration,
        formattedDuration: newTrack.formattedDuration,
        title: newTrack.title,
        thumbnail: newTrack.thumbnail,
        channel: newTrack.channel,
        progress: 0,
        isPlaying: true
      }
    }
    nowPlayingRef.set(newNowPlaying);
    roomRef.child("queue").set(newQueue);
    this.setState({nowPlaying:null});
  };

  //for now, resets the queue
  handleBackwardClick = () => {
    //TODO let's implement this last

    var reset = {
      key: "evanTest",
      nowPlaying: {
        baseUrl: "https://www.youtube.com/watch?v=phn2JZ2xTz4",
        url: "https://www.youtube.com/watch?v=phn2JZ2xTz4",
        duration: 241,
        title: "save our souls",
        progress:0,
        isPlaying:true
      },
      queue: {
        songId1: {
          url: "https://www.youtube.com/watch?v=Zasx9hjo4WY",
          title: "zedd ignite",
          duration: 227
        },
        songId2: {
          url: "https://www.youtube.com/watch?v=B7xai5u_tnk",
          title: "fatrat monody",
          duration: 290
        },
        songId3: {
          url: "https://www.youtube.com/watch?v=dXHVuIqGzSU",
          title: "aftergold big wild",
          duration: 230
        }
      }
    };

    var queueRef = firebase.database().ref("channels/" + this.props.room);
    queueRef.set(reset);

  };

  // handleLoopClick = () => {
  //   let toggleLooping = !this.state.isLooping;
  //   //TODO update firebase instead of state here
  //   this.setState({isLooping:toggleLooping});
  // };

  //updates the state and firebase with each 'onProgress' call made by the react-player to make sure any joining users are up to date with the player
  onProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      if(state.hasOwnProperty("played")){
        if(this.state.nowPlaying.progress - state["played"] > 0.05) {
          this.forceUpdate();
        } else {
          var newNowPlayingState = this.state.nowPlaying;
          newNowPlayingState.progress = state["played"];
          this.setState(newNowPlayingState);
          firebase.database().ref("channels/"+ this.props.room +"/nowPlaying").set(newNowPlayingState);
        }
      }
    }
  };

  //converts a time elapsed value into a valid youtube timestamp
  convertToYoutubeTimestamp = timeElapsed => {
    var radix = 10;
    var hours = "";
    if(timeElapsed > 3600) {
      hours = "" + (parseInt(timeElapsed / 3600, radix)) + "h";
      timeElapsed %= 3600;
    }
    var minutes = "";
    if(timeElapsed > 60) {
      minutes =  "" + parseInt(timeElapsed / 60, radix) + "m";
      timeElapsed %= 60;
    }
    var seconds = "";
    if(timeElapsed !== 0) {
      seconds = "" + parseInt(timeElapsed, radix) + "s";
    }
    if(hours || minutes || seconds) {
      return "&t=" + hours + minutes + seconds;
    } else {
      return "";
    }
  };

  //when the video ends, handles the aciton to take it to the next video
  onVideoEnd = () => {
    this.handleForwardClick();
  };



  //handles a user's changing volume
  handleVolumeChange = (e, value) => {
    this.setState({volume:value});
  };

  //renders the entire video player
  render() {

    var content = <div>There are currently no songs queued up!</div>;
    if(this.state.nowPlaying) {

      var updated = JSON.parse(localStorage.getItem("updated"));
      var urlToInput = this.state.nowPlaying.baseUrl;
      var tempUrl = JSON.parse(localStorage.getItem("tempUrl"));
      if(!updated && this.state.nowPlaying.progress) {
        if((tempUrl === null || tempUrl === undefined) ) {
          var timeOfCurrentVideo = this.state.nowPlaying.progress * this.state.nowPlaying.duration;
          tempUrl = this.state.nowPlaying.baseUrl + this.convertToYoutubeTimestamp(timeOfCurrentVideo);
          localStorage.setItem("tempUrl",JSON.stringify(tempUrl));
        }
        urlToInput = tempUrl;
        localStorage.setItem("updated", JSON.stringify(true));
      } else if(tempUrl && tempUrl.startsWith(this.state.nowPlaying.baseUrl)) {
        urlToInput = tempUrl;
      } else {
        localStorage.removeItem("tempUrl");
      }

      content = <div>
        <div className="row">

          <div className="col l8 offset-l2 offset-m1 m10 s12">
            <VideoContainer
              onProgress={this.onProgress}
              onVideoEnd={this.onVideoEnd}
              url={urlToInput}
              nowPlaying={this.state.nowPlaying}
              volume={this.state.volume}
            />
          </div>
          <div className="col s12 center-align">
            <h1 className="flow-text">{this.state.nowPlaying.title}</h1>
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <PlaybackControls
              isPlaying={this.state.nowPlaying.isPlaying}
              playPauseCallback={this.handlePlayPauseClick}
              forwardCallback={this.handleForwardClick}
              backwardCallback={this.handleBackwardClick}
              volumeCallback={this.handleVolumeChange}
            />
          </div>
        </div>
      </div>
    }

    return (content);
  }
}

//Video container that has the playing youtube video for the room
class VideoContainer extends React.Component {

  //renders the video container
  render() {


    return (
      <ReactPlayer
        style={{pointerEvents: 'none'}}
        className="responsive-video, z-depth-1"
        width={'100%'}
        playing={this.props.nowPlaying.isPlaying}
        url={this.props.url}
        onProgress={this.props.onProgress}
        onDuration={this.props.onDuration}
        onEnded={this.props.onVideoEnd}
        progressFrequency={500}
        played={this.props.nowPlaying.progress}
        volume={this.props.volume}
        controls={false}
      />);
  }
}

//Playback controls for the Radio Player
class PlaybackControls extends React.Component {

  select = index => {

  }

  //renders the playback controls
  render() {
    return (
      <div className="row">
        <div className="col s8 offset-s2">
          <BottomNavigation style={{backgroundColor: '#212121'}}>
            <BottomNavigationItem
              label={!this.props.isPlaying ? "Play" : "Pause"}
              icon={!this.props.isPlaying ? <PlayIcon/> : <PauseIcon/>}
              onTouchTap={this.props.playPauseCallback}
            />
            <BottomNavigationItem
              label="Forward"
              icon={<ForwardIcon/>}
              onTouchTap={this.props.forwardCallback}
            />
          </BottomNavigation>
        </div>
        <div className="col s2">
          <Slider
            defaultValue={0.75}
            axis={'y'}
            style={{height: '100px', marginTop: '-55px'}}
            onChange={this.props.volumeCallback}
          />
        </div>
      </div>
    );
  }
}

export default RadioPlayer;
