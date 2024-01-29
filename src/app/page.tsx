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
            if (key === "product_name" || key === "wazen_price") {
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
                wazen: row["wazen_price"],
              });
            }
          }
        }

        // Wait for all promises to resolve
        const columnResults = await Promise.all(promises);
        setProccessedProductsCount((prevCount) => prevCount + 1);

        // trun columnResults into an object
        // the object has the format of {[elemnet.key]: element.price}
        const columnResultsObj = columnResults.reduce(
          (acc: any, curr: any) => {
            if (curr?.key) {
              acc[curr.key] = curr.available ? curr.price : "not available";
            }
            return acc;
          },
          { product_name: row["product_name"], wazen: row["wazen_price"] }
        );

        // Save the results in a new object in the results array
        result.push(columnResultsObj);
      }

      const proccessedResutls = processResults(result);
      console.log("result:", result);
      console.log("proccessedResutls:", proccessedResutls);

      const csv = Papa.unparse(result);
      var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var csvURL = window.URL.createObjectURL(csvData);
      var testLink = document.createElement("a");
      testLink.href = csvURL;
      testLink.setAttribute("download", "report.csv");
      testLink.click();

      setTimeout(() => {
        const csv2 = Papa.unparse(proccessedResutls);
        var csvData2 = new Blob([csv2], { type: "text/csv;charset=utf-8;" });
        var csvURL2 = window.URL.createObjectURL(csvData2);
        var testLink2 = document.createElement("a");
        testLink2.href = csvURL2;
        testLink2.setAttribute("download", "summary_report.csv");
        testLink2.click();
      }, 1000);

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

type results = {
  amazon: number | string;
  btech: number | string;
  cairo_sales: number | string;
  ehabcenter: number | string;
  elghazawy: number | string;
  eliraqi: number | string;
  elsindbad: number | string;
  jumia: number | string;
  noon: number | string;
  product_name: string;
  raneen: number | string;
  rayashop: number | string;
  wazen: number;
};

// const processResults = (results: results[]) => {
//   console.log("results:", results);
//   // loop over the results
//   // for each result
//   // create new object with all the keys except for product_name
//   // remove any entry which has a non number value
//   // calcualte if waze price is high by checking: if waze price is higher than the lowest price by 100
//   // calcualte if waze price is low by checking: if waze price is lower than the lowest price by 100
//   // create an object of the format
//   //{product_name: "product_name", wazen_price: "waze_price", wazen_price_is_high: boolean, closest_price_below:number, closeste_price_below_provide:string,
//   // lowest_price:number, lowest_price_provider: string, wazen_price_is_low: boolean, closest_price_above:number, closest_price_above_provider:string, highest_price:number, highest_price_provider:string}

//   const proccessedResutls = [
//     [
//       "product_name",
//       "wazen_price",
//       "wazen_price_is_high",
//       "closest_price_below",
//       "closest_price_below_provider",
//       "lowest_price",
//       "lowest_price_provider",
//       "wazen_price_is_low",
//       "closest_price_above",
//       "closest_price_above_provider",
//       "highest_price",
//       "highest_price_provider",
//     ],
//   ];
//   for (let i = 0; i < results.length; i++) {
//     const result = results[i];
//     const { product_name, ...rest } = result;

//     //remove any entry which has a non number value
//     const filteredRest = Object.entries(rest).reduce((acc, [key, value]) => {
//       if (typeof value === "number") {
//         // @ts-ignore
//         acc[key] = value;
//       }
//       return acc;
//     }, {});

//     // @ts-ignore
//     const wazenPrice = filteredRest.wazen;
//     console.log("wazenPrice:", wazenPrice);
//     //find lowest price and lowest price provider
//     //@ts-ignore
//     const lowestPrice = Math.min(...Object.values(filteredRest));
//     console.log("lowestPrice:", lowestPrice);
//     const lowestPriceProvider = Object.keys(filteredRest).find(
//       // @ts-ignore
//       (key) => filteredRest[key] === lowestPrice
//     );
//     console.log("lowestPriceProvider:", lowestPriceProvider);
//     //find highest price and highest price provider
//     //@ts-ignore
//     const highestPrice = Math.max(...Object.values(filteredRest));
//     console.log("highestPrice:", highestPrice);
//     const highestPriceProvider = Object.keys(filteredRest).find(
//       //@ts-ignore
//       (key) => filteredRest[key] === highestPrice
//     );
//     console.log("highestPriceProvider:", highestPriceProvider);
//     // calcualte if wazen price is high by checking: if wazen price is higher than the lowest price by 100
//     const wazenPriceIsHigh = wazenPrice > lowestPrice + 100;
//     console.log("wazenPriceIsHigh:", wazenPriceIsHigh);

//     // calcualte if wazen price is low by checking: if wazen price is lower than the lowest price by 100
//     const wazenPriceIsLow = wazenPrice < lowestPrice - 100;
//     console.log("wazenPriceIsLow:", wazenPriceIsLow);

//     let closestPriceAbove = "";
//     let closestPriceAboveProvider = "";
//     let closestPriceBelow = "";
//     let closestPriceBelowProvider = "";

//     if (wazenPriceIsHigh) {
//       // find the closest price below
//       //@ts-ignore
//       closestPriceBelow = Object.values(filteredRest).reduce(
//         //@ts-ignore
//         (acc: number, curr: number) => {
//           if (curr < wazenPrice && curr > acc) {
//             return curr;
//           }
//           return acc;
//         },
//         0
//       );
//       //@ts-ignore
//       closestPriceBelowProvider = Object.keys(filteredRest).find(
//         //@ts-ignore
//         (key) => filteredRest[key] === closestPriceBelow
//       );
//       proccessedResutls.push([
//         product_name,
//         wazenPrice,
//         wazenPriceIsHigh,
//         closestPriceBelow,
//         closestPriceBelowProvider,
//         lowestPrice,
//         lowestPriceProvider,
//         wazenPriceIsLow,
//         "",
//         "",
//         "",
//         "",
//       ]);
//     }
//     if (wazenPriceIsLow) {
//       // find the closest price above
//       //@ts-ignore
//       closestPriceAbove = Object.values(filteredRest).reduce(
//         //@ts-ignore
//         (acc: number, curr: number) => {
//           if (curr > wazenPrice && curr < acc) {
//             return curr;
//           }
//           return acc;
//         },
//         100000
//       );
//       //@ts-ignore
//       closestPriceAboveProvider = Object.keys(filteredRest).find(
//         //@ts-ignore
//         (key) => filteredRest[key] === closestPriceAbove
//       );
//       proccessedResutls.push([
//         product_name,
//         wazenPrice,
//         wazenPriceIsHigh,
//         "",
//         "",
//         "",
//         "",
//         wazenPriceIsLow,
//         closestPriceAbove,
//         closestPriceAboveProvider,
//         highestPrice,
//         highestPriceProvider,
//       ]);
//     }
//   }

//   return proccessedResutls;
// };

const processResults = (results: results[]) => {
  console.log("results:", results);
  // loop over the results
  // for each result
  // create new object with all the keys except for product_name
  // remove any entry which has a non number value
  // calcualte if waze price is high by checking: if waze price is higher than the lowest price by 100
  // calcualte if waze price is low by checking: if waze price is lower than the lowest price by 100
  // create an object of the format
  //{product_name: "product_name", wazen_price: "waze_price", wazen_price_is_high: boolean, closest_price_below:number, closeste_price_below_provide:string,
  // lowest_price:number, lowest_price_provider: string, wazen_price_is_low: boolean, closest_price_above:number, closest_price_above_provider:string, highest_price:number, highest_price_provider:string}

  const proccessedResutls = [
    [
      "product_name",
      "wazen_price",
      "wazen_price_is_high",
      "closest_price_below",
      "closest_price_below_provider",
      "lowest_price",
      "lowest_price_provider",
      "↔↔↔",
      "wazen_price_is_low",
      "closest_price_above",
      "closest_price_above_provider",
      "highest_price",
      "highest_price_provider",
    ],
  ];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const { product_name, wazen, ...rest } = result;
    //remove any entry which has a non number value
    const filteredRest = Object.entries(rest).reduce((acc, [key, value]) => {
      if (typeof value === "number") {
        // @ts-ignore
        acc[key] = value;
      }
      return acc;
    }, {});
    if (Object.entries(filteredRest).length === 0) continue;
    const wazen_price = wazen;
    //find lowest price and lowest price provider
    //@ts-ignore
    const lowestPrice = Math.min(...Object.values(filteredRest));
    const lowestPriceProvider = Object.keys(filteredRest).find(
      // @ts-ignore
      (key) => filteredRest[key] === lowestPrice
    );
    //find highest price and highest price provider
    //@ts-ignore
    const highestPrice = Math.max(...Object.values(filteredRest));
    const highestPriceProvider = Object.keys(filteredRest).find(
      //@ts-ignore
      (key) => filteredRest[key] === highestPrice
    );
    // calcualte if wazen price is high by checking: if wazen price is higher than the lowest price by 100
    const wazenPriceIsHigh = wazen_price > lowestPrice + 100;

    // calcualte if wazen price is low by checking: if wazen price is lower than the lowest price by 100
    const wazenPriceIsLow = wazen_price < lowestPrice - 100;

    let closestPriceAbove = "";
    let closestPriceAboveProvider = "";
    let closestPriceBelow = "";
    let closestPriceBelowProvider = "";

    if (wazenPriceIsHigh) {
      // find the closest price below
      //@ts-ignore
      closestPriceBelow = Object.values(filteredRest).reduce(
        //@ts-ignore
        (acc: number, curr: number) => {
          if (curr < wazen_price && curr > acc) {
            return curr;
          }
          return acc;
        },
        0
      );
      //@ts-ignore
      closestPriceBelowProvider = Object.keys(filteredRest).find(
        //@ts-ignore
        (key) => filteredRest[key] === closestPriceBelow
      );
      proccessedResutls.push([
        product_name,
        wazen_price,
        wazenPriceIsHigh,
        closestPriceBelow,
        closestPriceBelowProvider,
        lowestPrice,
        lowestPriceProvider,
        "◀️▶️",
        "➖",
        "➖",
        "➖",
        "➖",
        "➖",
      ]);
    }
    if (wazenPriceIsLow) {
      // find the closest price above
      //@ts-ignore
      closestPriceAbove = Object.values(filteredRest).reduce(
        //@ts-ignore
        (acc: number, curr: number) => {
          if (curr > wazen_price && curr < acc) {
            return curr;
          }
          return acc;
        },
        100000
      );
      //@ts-ignore
      closestPriceAboveProvider = Object.keys(filteredRest).find(
        //@ts-ignore
        (key) => filteredRest[key] === closestPriceAbove
      );
      proccessedResutls.push([
        product_name,
        wazen_price,
        "➖",
        "➖",
        "➖",
        "➖",
        "➖",
        "◀️▶️",
        wazenPriceIsLow,
        closestPriceAbove,
        closestPriceAboveProvider,
        highestPrice,
        highestPriceProvider,
      ]);
    }
  }

  return proccessedResutls;
};
