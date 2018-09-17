import React, { Component } from "react";
import styled, { keyframes } from "styled-components";
import Sound from "react-sound";

import "./App.css";
import coverImage from "./starboy-the-weekend-cover.jpg";

const AppView = styled.div`
  display: flex;
  flex-flow: column nowrap;

  height: 100vh;
  width: 100vw;
`;

const TopView = styled.div`
  flex: 0.66;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  overflow: hidden;

  ::before {
    content: "";
    background: url(${coverImage});
    background-size: cover;
    filter: blur(0.2em);

    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
`;

const BottomView = styled.div`
  flex: 0.36;
  background: rgb(100, 100, 128);

  display: flex;
  flex-flow: column nowrap;
  align-items: center;
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
`;

const TimerView = styled.div`
  flex: 1;

  width: 100vw;

  display: flex;
  justify-content: center;
  align-items: center;

  color: lightgrey;

  font-size: 64px;
`;

const TitleView = styled.div`
  flex: 1;

  width: 100vw;

  display: flex;
  justify-content: center;
  align-items: center;

  color: white;

  font-size: 64px;
`;

const angleFromSeconds = seconds => (360 * seconds) / 30;
const formatTimer = s => {
  const seconds = Math.round(s % 60);
  const minutes = Math.round(s / 60);

  let formattedTimer = "";

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

class Timer extends Component {
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
    const timer =
      this.props.offset +
      Math.round((Date.now() - this.props.playTimestamp) / 1000);
    return formatTimer(timer);
  }
}

class App extends Component {
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
          play,
          duration
        };
      }

      return {
        play,
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
      return {
        play: false,
        duration: 0,
        playTimestamp: 0
      };
    });
  };

  render() {
    const { play } = this.state;

    const timer = play ? (
      <Timer
        offset={this.state.duration}
        playTimestamp={this.state.playTimestamp}
      />
    ) : (
      formatTimer(this.state.duration)
    );

    // playStatus={play ? Sound.status.PLAYING : Sound.status.PAUSED}
    // playFromPosition={this.state.duration * 1000}

    const soundProps = {
      playStatus: play ? Sound.status.PLAYING : Sound.status.PAUSED,
      playFromPosition: this.state.duration * 1000
    };

    return (
      <AppView>
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
        <BottomView>
          <TimerView>{timer}</TimerView>
          <TitleView>Starboy - The weekend</TitleView>
          <HorizontalGroup>
            <Button onClick={this.handleBack}>{"<<"}</Button>
            <Button onClick={this.handlePlay}>{play ? "||" : ">"}</Button>
            <Button onClick={this.handleNext}>{">>"}</Button>
          </HorizontalGroup>
        </BottomView>
      </AppView>
    );
  }
}

export default App;
