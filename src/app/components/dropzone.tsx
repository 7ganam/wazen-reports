"use client";

import React, { useMemo } from "react";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import Dropzone from "react-dropzone";
import { Button } from "@/components/ui/button";

type DropZoneProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  isFocused: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  open: () => void;
  acceptedFiles: File[];
};

export default function DropZone({
  getRootProps,
  getInputProps,
  isFocused,
  isDragAccept,
  isDragReject,
  open: openFileSelector,
  acceptedFiles,
}: DropZoneProps) {
  const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderWidth: 2,
    borderRadius: 4,
    borderColor: "black",
    borderStyle: "dashed",
    minHeight: "300px",
    backgroundColor: "#E2E8F0",
    color: "black",
    outline: "none",
    transition: "border .24s ease-in-out",
    justifyContent: "center",
  };

  const focusedStyle = {
    borderColor: "#2196f3",
  };

  const acceptStyle = {
    borderColor: "#00e676",
  };

  const rejectStyle = {
    borderColor: "#ff1744",
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const files = acceptedFiles.map((file) => (
    <div
      // @ts-ignore
      key={file.path}
    >
      {/* @ts-ignore */}
      {file.path} - {file.size} bytes
    </div>
  ));

  return (
    <Dropzone multiple={false}>
      {({}) => (
        <div className="container">
          {/* @ts-ignore */}
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />

            <p>Drag and drop your file here</p>

            <Button
              onClick={openFileSelector}
              variant="outline"
              className="mt-4"
            >
              Open File Dialog
            </Button>
          </div>
          <div style={{ marginTop: "10px" }}>{files}</div>
        </div>
      )}
    </Dropzone>
  );
}
