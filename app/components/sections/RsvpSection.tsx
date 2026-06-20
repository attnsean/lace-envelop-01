"use client";

import React from "react";
import BlessingWall from "../BlessingWall";
import { DbProject, DbGuest, DbWish } from "../../../lib/resolveProject";

interface Props {
  project?: DbProject | null;
  guestName: string;
  guest?: DbGuest | null;
  wishes?: DbWish[] | null;
  galleryImages: string[];
}

export default function RsvpSection({ project, guestName, guest, wishes, galleryImages }: Props) {
  if (project?.subscriptions?.packages?.has_rsvp === false) {
    return null;
  }

  return (
    <BlessingWall
      guestName={guestName}
      guest={guest}
      projectId={project?.id}
      wishes={wishes}
      hasRsvp={true}
      hasGuestbook={false}
      project={project}
      galleryImages={galleryImages}
    />
  );
}
