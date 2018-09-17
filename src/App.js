import * as React from "react";
import styled, { keyframes } from "styled-components";
import Sound from "react-sound";

import coverImage from "./starboy-the-weekend-cover.jpg";
import PlayIcon from "./svgs/play-icon.svg";
import PauseIcon from "./svgs/pause-icon.svg";
import PrevIcon from "./svgs/prev-icon.svg";
import NextIcon from "./svgs/next-icon.svg";

const AppView = styled.div`
  display: flex;
  flex-flow: column nowrap;

  height: 100vh;
  width: 100vw;
`;

/** Top view  */

const TopView = styled.div`
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  overflow: hidden;

  ::before {
    content: "";
    background: url(${coverImage});
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

  background: ${props => props.background || `url(${coverImage})`};
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
  left: 0.5em;
  top: -1.1em;

  display: flex;
  justify-content: center;
  align-items: center;

  color: white;

  font-size: 1em;
  text-align: left;
`;

const TimeCursor = styled.div`
  width: 4px;
  height: 8px;

  position: relative;
  left: ${props => props.position || "0"}px;
  top: -2px;

  background: white;
`;

const RemainingView = styled(TimerView)`
  width: 42px;
  left: calc(100vw - 42px - 0.5em);
  top: -1.1em;

  text-align: right;
`;

/** Bottom view  */

const BottomView = styled.div`
  flex: 0.5;

  width: 100vw;
  background: rgb(32, 32, 32);

  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  overflow: hidden;
  white-space: nowrap;
`;

const TitleView = styled.div`
  flex: 1;

  width: 100vw;
  height: 2em;
  margin-left: 0.25em;

  color: white;
  text-align: center;
  font-size: 2em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
    duration: 0
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
      return {
        play: false,
        duration: 0,
        playTimestamp: 0
      };
    });
  };

  handleNext = () => {
    this.setState(prev => {
      const nextDuration = prev.duration + 30;
      const isFinished = nextDuration >= 273;
      return {
        play: isFinished ? false : prev.play,
        duration: isFinished ? 273 : prev.duration + 30
      };
    });
  };

  render() {
    const { play } = this.state;

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
        <Sound autoLoad={true} volume={50} url={"test.mp3"} {...soundProps} />
        <TopView>
          <RootDisc
            size={"50vmin"}
            background={"rgb(232, 232, 232)"}
            play={play}
            angle={angleFromSeconds(this.state.duration)}
          >
            <Disc size={"99%"}>
              <Disc size={"33%"} background={"rgb(64, 64, 64)"}>
                <Disc size={"90%"} background={"rgb(232, 232, 232)"}>
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
          <TimerView>{timer(this.state.duration)}</TimerView>
          <RemainingView>{timer(this.state.duration, 273)}</RemainingView>
        </MiddleView>
        <BottomView>
          <TitleView>Starboy - The weekend</TitleView>
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
