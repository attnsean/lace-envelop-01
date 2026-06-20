"use client";

import React from "react";
import TimelineSection, { StoryEvent } from "../TimelineSection";
import { DbProject } from "../../../lib/resolveProject";

interface Props {
  project?: DbProject | null;
}

export default function LoveStorySection({ project }: Props) {
  if (project?.subscriptions?.packages?.has_love_story === false) {
    return null;
  }

  return (
    <TimelineSection loveStoryItems={project?.love_story_items as StoryEvent[] | null | undefined} />
  );
}
