import { AbsoluteFill, Composition, Sequence, useCurrentFrame, interpolate, spring } from "remotion";
import { OpeningScene } from "./scenes/OpeningScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { ToolsScene } from "./scenes/ToolsScene";
import { WorkflowScene } from "./scenes/WorkflowScene";
import { ExamplesScene } from "./scenes/ExamplesScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { EndingScene } from "./scenes/EndingScene";
import { UpdateV103Scene } from "./scenes/UpdateV103Scene";

const MyVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      <Sequence from={0} durationInFrames={100}>
        <OpeningScene />
      </Sequence>
      <Sequence from={100} durationInFrames={100}>
        <ProblemScene />
      </Sequence>
      <Sequence from={200} durationInFrames={150}>
        <SolutionScene />
      </Sequence>
      <Sequence from={350} durationInFrames={150}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={500} durationInFrames={200}>
        <ToolsScene />
      </Sequence>
      <Sequence from={700} durationInFrames={150}>
        <WorkflowScene />
      </Sequence>
      <Sequence from={850} durationInFrames={150}>
        <ExamplesScene />
      </Sequence>
      <Sequence from={1000} durationInFrames={100}>
        <ArchitectureScene />
      </Sequence>
      <Sequence from={1100} durationInFrames={100}>
        <EndingScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export const VideoPromo: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoPromo"
        component={MyVideo}
        durationInFrames={1200}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="UpdateV103"
        component={UpdateV103Scene}
        durationInFrames={2160}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
