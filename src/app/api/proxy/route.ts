// api > hello > route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { parse } from "./parsers/index";
const axiosConfig = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
  },
};

const fetchPrice = async (url: string) => {
  try {
    const response = await axios.get(url, axiosConfig);

    const html = response.data;

    const result = parse(html, url);
    return result;
  } catch (error) {
    throw error;
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log(request.nextUrl.searchParams.get("site"));
    const startTime = performance.now();
    const result = await fetchPrice(
      request.nextUrl.searchParams.get("site") as string
    );
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log(`Execution time: ${executionTime} milliseconds`);

    const finalResutl = {
      ...result,
      executionTime,
    };

    const json = {
      finalResutl,
    };

    return NextResponse.json(json);
  } catch (error: any) {
    const res = {
      available: false,
      price: 0,
      url: request.nextUrl.searchParams.get("site"),
      error: true,
      message: error?.message,
    };
    return NextResponse.json(res);
  }
}
