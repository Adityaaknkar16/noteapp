import React from "react";
import Flowers from "./Flowers";
import Leaves from "./Leaves";
import { Squiggle, Sparkle, Swirl, Asterisk } from "./Doodles";
import {
  CornerTopLeft,
  CornerTopRight,
  CornerBottomLeft,
  CornerBottomRight,
} from "./Corners";

export default function PageDecor({
  variant = "dashboard",
  density = "normal",
}) {
  const isSubtle = density === "subtle";
  const opacity = isSubtle ? 0.12 : 0.22;

  // Render different set of illustrations based on variant
  switch (variant) {
    case "login":
    case "signup":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          {/* Top-left corner flourish */}
          <CornerTopLeft
            color="var(--accent-sage)"
            size="180px"
            opacity={opacity}
            className="absolute top-4 left-4"
          />
          {/* Bottom-right corner flourish */}
          <CornerBottomRight
            color="var(--accent-rust)"
            size="200px"
            opacity={opacity}
            className="absolute bottom-4 right-4"
          />
          {/* Accent sparkles in background */}
          {!isSubtle && (
            <>
              <Sparkle
                color="var(--accent-ochre)"
                size="50px"
                opacity={0.15}
                rotate={15}
                className="absolute top-[20%] right-[15%]"
              />
              <Asterisk
                color="var(--accent-rust)"
                size="40px"
                opacity={0.12}
                rotate={45}
                className="absolute bottom-[25%] left-[12%]"
              />
            </>
          )}
        </div>
      );

    case "dashboard":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          {/* Single clean leaf sprig in the bottom corner */}
          <Leaves
            variant={3}
            color="var(--accent-sage)"
            size="160px"
            opacity={opacity}
            rotate={-15}
            className="absolute bottom-8 right-8"
          />
          {/* Small star sparkle near greeting */}
          <Sparkle
            color="var(--accent-ochre)"
            size="45px"
            opacity={0.14}
            rotate={10}
            className="absolute top-[8%] right-[10%]"
          />
          {!isSubtle && (
            <Leaves
              variant={2}
              color="var(--accent-blue)"
              size="120px"
              opacity={0.08}
              rotate={35}
              className="absolute top-[40%] left-6"
            />
          )}
        </div>
      );

    case "notes":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          {/* Daisy at bottom right */}
          <Flowers
            variant={1}
            color="var(--accent-sage)"
            size="170px"
            opacity={opacity}
            rotate={10}
            className="absolute bottom-6 right-6"
          />
          {/* Olive branch at bottom left */}
          <Leaves
            variant={4}
            color="var(--accent-sage)"
            size="180px"
            opacity={opacity - 0.05}
            rotate={45}
            className="absolute bottom-12 left-6"
          />
          {!isSubtle && (
            <Asterisk
              color="var(--accent-rust)"
              size="30px"
              opacity={0.1}
              className="absolute top-[15%] right-[20%]"
            />
          )}
        </div>
      );

    case "tasks":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          {/* Sprig stem at top right */}
          <Flowers
            variant={4}
            color="var(--accent-rust)"
            size="160px"
            opacity={opacity}
            rotate={15}
            className="absolute top-[10%] right-10"
          />
          {/* Fern at bottom left */}
          <Leaves
            variant={1}
            color="var(--accent-sage)"
            size="190px"
            opacity={opacity}
            rotate={-30}
            className="absolute bottom-6 left-6"
          />
          {!isSubtle && (
            <Squiggle
              color="var(--accent-ochre)"
              size="70px"
              opacity={0.12}
              rotate={-5}
              className="absolute bottom-[20%] right-[15%]"
            />
          )}
        </div>
      );

    case "diary":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          {/* Rose peony swirl */}
          <Flowers
            variant={2}
            color="var(--accent-ochre)"
            size="180px"
            opacity={opacity}
            rotate={20}
            className="absolute bottom-8 right-8"
          />
          {/* Detailed leaf */}
          <Leaves
            variant={2}
            color="var(--accent-sage)"
            size="150px"
            opacity={opacity}
            rotate={-45}
            className="absolute top-[12%] right-12"
          />
          {!isSubtle && (
            <Swirl
              color="var(--accent-blue)"
              size="60px"
              opacity={0.1}
              className="absolute bottom-[25%] left-10"
            />
          )}
        </div>
      );

    case "habits":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          {/* Wildflower sprig */}
          <Flowers
            variant={4}
            color="var(--accent-sage)"
            size="180px"
            opacity={opacity}
            className="absolute bottom-10 right-10"
          />
          {/* Leaf stem */}
          <Leaves
            variant={3}
            color="var(--accent-sage)"
            size="160px"
            opacity={opacity - 0.05}
            rotate={-25}
            className="absolute bottom-14 left-6"
          />
          {!isSubtle && (
            <Sparkle
              color="var(--accent-ochre)"
              size="45px"
              opacity={0.15}
              className="absolute top-[10%] right-[25%]"
            />
          )}
        </div>
      );

    case "calendar":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          <Leaves
            variant={4}
            color="var(--accent-blue)"
            size="160px"
            opacity={opacity}
            rotate={40}
            className="absolute bottom-6 right-6"
          />
          <CornerTopRight
            color="var(--accent-blue)"
            size="130px"
            opacity={opacity - 0.05}
            className="absolute top-4 right-4"
          />
        </div>
      );

    case "subjects":
      return (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden max-md:hidden"
          aria-hidden="true"
        >
          <Flowers
            variant={3}
            color="var(--accent-rust)"
            size="140px"
            opacity={opacity}
            rotate={15}
            className="absolute bottom-8 right-8"
          />
          <Leaves
            variant={1}
            color="var(--accent-sage)"
            size="170px"
            opacity={opacity}
            rotate={-15}
            className="absolute top-[10%] right-8"
          />
        </div>
      );

    case "empty-state":
      return (
        <div
          className="pointer-events-none select-none z-0 w-full flex justify-center mt-2"
          aria-hidden="true"
        >
          {/* A single tiny delicate flower blossom in the empty card */}
          <Flowers
            variant={3}
            color="var(--accent-sage)"
            size="45px"
            opacity={0.25}
            rotate={12}
          />
        </div>
      );

    default:
      return null;
  }
}
