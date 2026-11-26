import React from "react";
import { Composition } from "remotion";
import { HanukkahPromo } from "./HanukkahPromo";

export const RemotionRoot: React.FC = () => {
  const sharedProps = { durationInFrames: 900, fps: 30, width: 1080, height: 1920 };
  return (
    <>
      <Composition
        id="HanukkahPromoHE"
        component={HanukkahPromo}
        defaultProps={{ lang: "he" as const }}
        {...sharedProps}
      />
      <Composition
        id="HanukkahPromoEN"
        component={HanukkahPromo}
        defaultProps={{ lang: "en" as const }}
        {...sharedProps}
      />
    </>
  );
};
