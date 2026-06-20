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

export default function GuestbookSection({ project, guestName, guest, wishes, galleryImages }: Props) {
  if (project?.subscriptions?.packages?.has_guestbook === false) {
    return null;
  }

  return (
    <BlessingWall
      guestName={guestName}
      guest={guest}
      projectId={project?.id}
      wishes={wishes}
      hasRsvp={false}
      hasGuestbook={true}
      project={project}
      galleryImages={galleryImages}
    />
  );
}
