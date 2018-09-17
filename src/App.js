import * as React from "react";
import styled, { keyframes } from "styled-components";
import Sound from "react-sound";

import song1Cove from "./covers/song1.jpg";
import PlayIcon from "./svgs/play-icon.svg";
import PauseIcon from "./svgs/pause-icon.svg";
import PrevIcon from "./svgs/prev-icon.svg";
import NextIcon from "./svgs/next-icon.svg";

const store = [
  {
    name: "Starboy - The Weekend",
    cover: require("./covers/song1.jpg"),
    music: "song1.mp3"
  },
  {
    name: "DJ Medhi - Signatune",
    cover: require("./covers/song2.jpg"),
    music: "song2.mp3"
  }
];

const AppView = styled.div`
  display: flex;
  flex-flow: column nowrap;

  height: 100vh;
  width: 100vw;
`;

/** Top view  */

const TopView = styled.div`
  flex: 0.9;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  overflow: hidden;
  ::before {
    content: "";
    background: url(${props => props.cover});
    background-size: cover;
    background-position: center;
    filter: blur(0.25em);

    position: absolute;
    width: 105%;
    height: 105%;
    z-index: -1;
  }
`;

const Disc = styled.div`
  width: ${props => props.size || "50%"};
  height: ${props => props.size || "50%"};

  background: ${props => props.background || `url(${props.cover})`};
  background-size: contain;

  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.css || ""};
`;

const rotate = (initialAngle = 0) => keyframes`
  from {
    transform: rotate(${initialAngle}deg);
  }
  to {
    transform: rotate(${initialAngle + 360}deg);
  }
`;

const RootDisc = styled(Disc)`
  ${props =>
    props.play
      ? `animation: ${rotate(props.angle)} 30s linear infinite;`
      : `transform: rotate(${props.angle}deg);`};
`;

/** Middle view  */

const MiddleView = styled.div`
  width: 100%;
  height: 0.25em;

  background: red;rgb(100, 100, 128);

  position: relative;
`;

const TimerView = styled.div`
  width: 42px;
  height: 1em;

  position: absolute;
  left: 0;
  top: 4.5em;

  display: flex;
  justify-content: center;
  align-items: center;

  color: white;

  text-align: left;
  font-size: 0.5em;
`;

const RemainingView = styled(TimerView)`
  left: calc(100vw - 42px);

  text-align: right;
`;

const TimeCursor = styled.div`
  width: 4px;
  height: 8px;

  position: relative;
  left: ${props => props.position || "0"}px;
  top: -2px;

  background: #d1d1d1;
  border-bottom: red 2px solid;
`;

const TitleView = styled.div`
  width: 100vw;
  height: 3em;

  padding: 0.25em;

  position: absolute;
  left: 0;
  top: -3em;

  background: rgba(42, 32, 32, 0.8);

  color: white;
  text-align: center;
  font-size: 1.5em;
  font-family: "Yanone Kaffeesatz";
  font-style: italic;
  font-weight: lighter;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Bottom view  */

const BottomView = styled.div`
  flex: 0.1;

  width: 100vw;
  background: rgb(32, 32, 32);

  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  overflow: hidden;
  white-space: nowrap;
`;

const HorizontalGroup = styled.div`
  width: 100%;

  display: flex;
  flex-flow: row nowrap;
`;

const Button = styled.button`
  border: 0;
  outline: none;

  flex: 1;
  height: 64px;

  font-size: 32px;
  font-weight: bold;

  background: #f1f1f1;
`;

const angleFromSeconds = seconds => (360 * seconds) / 30;
const formatTimer = (rawSeconds, reverse) => {
  const secs = reverse ? Math.abs(rawSeconds - reverse) : rawSeconds;
  const seconds = Math.round(secs % 60);
  const minutes = Math.floor(secs / 60);

  let formattedTimer = reverse ? "-" : "";

  if (minutes < 10) {
    formattedTimer += "0";
  }
  formattedTimer += minutes + "";

  formattedTimer += ":";

  if (seconds < 10) {
    formattedTimer += "0";
  }
  formattedTimer += seconds + "";

  return formattedTimer;
};
const currentTime = (offset, playTimestamp) =>
  offset + Math.round((Date.now() - playTimestamp) / 1000);

class TickedChild extends React.Component {
  timerHandle = null;
  componentDidMount() {
    this.timerHandle = requestAnimationFrame(this.tick);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.timerHandle);
  }

  tick = () => {
    this.forceUpdate();
    this.timerHandle = requestAnimationFrame(this.tick);
  };

  render() {
    return this.props.children();
  }
}

class App extends React.Component {
  appRef = React.createRef();

  state = {
    play: false,
    playTimestamp: 0,
    pauseTimestamp: 0,
    duration: 0,
    tuneIndex: 1
  };

  handlePlay = () => {
    this.setState(prev => {
      const play = !prev.play;

      if (!play) {
        const duration =
          prev.duration + (Date.now() - prev.playTimestamp) / 1000;
        return {
          play: false,
          duration
        };
      }

      const isFinished = prev.duration >= 273;

      return {
        play: !isFinished,
        playTimestamp: Date.now()
      };
    });
  };

  handleBack = () => {
    this.setState(prev => {
      const tuneIndex =
        prev.tuneIndex - 1 < 0 ? store.length - 1 : prev.tuneIndex - 1;

      return {
        play: false,
        duration: 0,
        playTimestamp: 0,
        tuneIndex: prev.playTimestamp === 0 ? tuneIndex : prev.tuneIndex
      };
    });
  };

  // TODO: Lerp disc rotation.
  handleNext = () => {
    this.setState(prev => {
      const nextDuration = prev.duration + 10;
      const isFinished = nextDuration >= 273;
      return {
        play: isFinished ? false : prev.play,
        duration: isFinished ? 0 : prev.duration + 10,
        tuneIndex: isFinished
          ? (prev.tuneIndex + 1) % store.length
          : prev.tuneIndex
      };
    });
  };

  render() {
    const { play, tuneIndex } = this.state;

    const timer = (time, reverse) =>
      play ? (
        <TickedChild>
          {() =>
            formatTimer(
              currentTime(this.state.duration, this.state.playTimestamp),
              reverse
            )
          }
        </TickedChild>
      ) : (
        formatTimer(time, reverse)
      );

    const soundProps = {
      playStatus: play ? Sound.status.PLAYING : Sound.status.PAUSED,
      playFromPosition: this.state.duration * 1000
    };

    return (
      <AppView ref={this.appRef}>
        <Sound
          autoLoad={true}
          volume={50}
          url={store[tuneIndex].music}
          {...soundProps}
        />
        <TopView cover={store[tuneIndex].cover}>
          <RootDisc
            size={"80vmin"}
            background={"rgb(232, 232, 232)"}
            play={play}
            angle={angleFromSeconds(this.state.duration)}
          >
            <Disc size={"99%"} cover={store[tuneIndex].cover}>
              <Disc size={"33%"} background={"rgb(64, 64, 64)"}>
                <Disc size={"90%"} background={"rgba(232, 232, 232, .9)"}>
                  <Disc size={"25%"} background={"rgb(32, 32, 32)"} />
                </Disc>
              </Disc>
            </Disc>
          </RootDisc>
        </TopView>
        <MiddleView>
          {/* TODO: Use lerp here with Popmotion/Reanimated like lib. */}
          <TickedChild>
            {() => {
              const screenWidth =
                (this.appRef.clientRect && this.appRef.clientRect.innerWidth) ||
                0;
              const timer = currentTime(
                this.state.duration,
                this.state.playTimestamp
              );
              const cursorPosition =
                ((!play ? this.state.duration : timer) * 320) / 273;
              return <TimeCursor position={cursorPosition} />;
            }}
          </TickedChild>
          <TitleView>
            {store[tuneIndex].name}
            <TimerView>{timer(this.state.duration)}</TimerView>
            <RemainingView>{timer(this.state.duration, 273)}</RemainingView>
          </TitleView>
        </MiddleView>
        <BottomView>
          <HorizontalGroup>
            <Button onClick={this.handleBack}>
              <img src={PrevIcon} />
            </Button>
            <Button onClick={this.handlePlay}>
              {play ? <img src={PauseIcon} /> : <img src={PlayIcon} />}
            </Button>
            <Button onClick={this.handleNext}>
              <img src={NextIcon} />
            </Button>
          </HorizontalGroup>
        </BottomView>
      </AppView>
    );
  }
}

export default App;
