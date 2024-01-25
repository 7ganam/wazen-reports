"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import DropZoneComponent from "./components/dropzone";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Logger from "@/components/ui/logger";

export default function Home() {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    open: openFileSelector,
    acceptedFiles,
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: {
      "text/html": [".csv"],
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [_uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const resetState = () => {
    setIsUploading(false);
    setUploadError("");
    setUploadSuccess(false);
  };

  const [data, setData] = useState([]);
  const fetchData = async (link: string, key: string) => {
    logProgress(`fetching data from : ${link}`);
    try {
      const apiUrl = `/api/proxy?site=${link}`;
      const response = await axios.get(apiUrl);
      const extractedData = response.data;
      setData(extractedData);
      const result = { ...extractedData.finalResutl, key };
      return result;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const uploadData = async (data: any) => {
    let result = [];

    try {
      setIsUploading(true);
      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        // Array to store promises for each URL in the column
        const promises = [];

        // Loop through each key in the column object
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            if (key === "product_name" || key === "our_price") {
              continue;
            }
            const value = row[key];

            // Check if the value is a valid URL
            if (/^https?:\/\//.test(value)) {
              // Push the promise to the array
              const promise = fetchData(value, key);
              promise.then(() => {
                logProgress(`finsihed processing product ${i + 1}: ${key}`);
              });

              promises.push(promise);
            } else {
              promises.push({
                key,
                price: "link_not_provided",
                available: true,
              });
            }
          }
        }

        // Wait for all promises to resolve
        const columnResults = await Promise.all(promises);
        setProccessedProductsCount((prevCount) => prevCount + 1);

        console.log("columnResults:", columnResults);

        // trun columnResults into an object
        // the object has the format of {[elemnet.key]: element.price}
        const columnResultsObj = columnResults.reduce(
          (acc: any, curr: any) => {
            if (curr?.key) {
              acc[curr.key] = curr.available ? curr.price : "not available";
            }
            return acc;
          },
          { product_name: row["product_name"] }
        );

        console.log("columnResultsObj:", columnResultsObj);
        // Save the results in a new object in the results array
        result.push(columnResultsObj);
      }

      const csv = Papa.unparse(result);
      var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var csvURL = window.URL.createObjectURL(csvData);
      var testLink = document.createElement("a");
      testLink.href = csvURL;
      testLink.setAttribute("test", "test.csv");
      testLink.click();

      console.log("result:", result);

      logProgress(`Finished proccessing all products 🎉🎉🎉`);
      setIsUploading(false);
    } catch (error) {
      console.error("Error:", error);
      const csv = Papa.unparse(result);
      var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var csvURL = window.URL.createObjectURL(csvData);
      var testLink = document.createElement("a");
      testLink.href = csvURL;
      testLink.setAttribute("test", "test.csv");
      testLink.click();
      setIsUploading(false);
    }
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (acceptedFiles.length === 0) {
      return;
    }

    setLogMessages([]);
    setProccessedProductsCount(0);

    const file = acceptedFiles[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        uploadData(results.data);
      },
    });

    // const startTime = performance.now();
    // await fetchData();
    // const endTime = performance.now();
    // const executionTime = endTime - startTime;
    // console.log(`Execution time: ${executionTime} milliseconds`);
  };

  const renderDialogActions = () => {
    if (isUploading) {
      return (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div> uploading transactions...</div>
          <div style={{ display: "flex" }}>
            <LoadingSpinner />
          </div>
        </div>
      );
    }
    if (uploadSuccess) {
      return <>successfully uploaded transactions</>;
    }
    return (
      <>
        <Button
          disabled={acceptedFiles.length === 0}
          type="submit"
          color="primary"
          onClick={handleOnSubmit}
        >
          Create Report
        </Button>
      </>
    );
  };

  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [proccessedProductsCount, setProccessedProductsCount] = useState(0);

  // Function to log progress updates
  const logProgress = (message: string) => {
    setLogMessages((prevMessages) => [...prevMessages, message]);
  };

  const [progress, setProgress] = useState(0);
  // Example usage
  const handleButtonClick = () => {
    logProgress(progress.toString());
    setProgress(progress + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-200">
      <Card className="w-[600px] max-w-[90%] shadow-lg">
        <CardHeader>
          <CardTitle>Create report</CardTitle>
          <CardDescription>upload csv file to create a report</CardDescription>
        </CardHeader>
        <CardContent>
          <DropZoneComponent
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isFocused={isFocused}
            isDragAccept={isDragAccept}
            isDragReject={isDragReject}
            open={openFileSelector}
            acceptedFiles={acceptedFiles}
          />
        </CardContent>
        <CardFooter>
          {!isUploading ? (
            <div className="flex justify-end gap-3 w-[100%] px-[30px]">
              {renderDialogActions()}
            </div>
          ) : (
            <div className="flex justify-end gap-3 w-[100%] px-[30px] mr-5">
              <div className="flex  items-center justify-center">
                <div className="text-sm mr-2">Proccessed Products:</div>
                <div className="text-sm">{proccessedProductsCount}</div>
              </div>
              <LoadingSpinner />
            </div>
          )}
        </CardFooter>
      </Card>
      <Card className="w-[600px] max-w-[90%] shadow-lg h-[200px] p-[10px] flex items-center justify-center mt-3">
        <Logger messages={logMessages} />
      </Card>
    </main>
  );
}

export const LoadingSpinner = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"animate-spin"}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
