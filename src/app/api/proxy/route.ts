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

const noonAxisoConfigs = {
  headers: {
    authority: "www.noon.com",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    cookie:
      'nguestv2=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJraWQiOiIyODIyNzk2ZTQ2YTE0YmIxOTQ4OTNhOTQ4Y2Q2MjZmNSIsImlhdCI6MTcwOTg2OTc5NywiZXhwIjoxNzA5ODcwMDk3fQ.IorAl8aym-TxAMbB6fR2pwV_ZPy_QOuCwRdm-kj6HaY; AKA_A2=A; nloc=ar-eg; visitor_id=a9719965-cead-4ce7-8843-2a11fade49ee; bm_mi=052493704302F4AC12083762C5B9E146~YAAQITwSAgCHVgqOAQAAq5kuHBdUnQPwtURgrnAtkLP52dpjjKYJF4wfcEqy2IP+y5ujsGdfdAPnO+9mSUjb2v5PH1N9XH26mNh5lil4conS2r8PZ7H37vb5XC554Ic0ZtiO87AE8qodAgpBWg57BzmxQnO/KFWAmfdEn0aalMwkbob2fQpWqf6fFFNUfVki0df5Sm8nmTgVkHKah9HDcoN8ne27oZf3oNoJLXrt32rVAIAF0AxHOcqyoMkkpm8tG1PhAnOh3xGCtQOa8iJRsqxjLwFKBza9nxurs4tbGKt9KV+3xqsf49IgpFve0IZ754C7atKxCBOtnNSo+EnCSuei3PGVm/1B~1; x-available-eg=ecom; ak_bmsc=E813774FCB84FCC71D62E5B57AA43089~000000000000000000000000000000~YAAQITwSAhuHVgqOAQAAup4uHBcbcd+M0Psky5SUOvIVxSXCnj2ou2zTZPPcSWtRLnZUBhQ6e0LC6r2bkt63IQ2EnPNp9aCX6PMZCFxSC9FH61CnE7Hlc3Pm0FxUy66XGijJCz/IpDQGBNojiyAcJWHziCQGzqYXVuEiQMmUbrAzIu5I7v+0mfslGn1jEy22qYZGncXMT3EG5gvH8412NpKt6zMNR0UpEPrfPcz/RlPf3D5b2om/+v/Sq3DOga1/4OSlxhmeEzRGNKd9Asds+nBY0R2g7SMYnWOCHVWWf00R+db4wj2rMWqw8ENP1viyGhCZKKodo9qKlZY8aMwNfFSEa+M1CA1zy1PV1/vVEFYbGPTyLLJMNCKjnkkoicAlb340SkL8wtiknrHu1fwoFCMnWQAs3TgE988sFBxV9g1LZ6jsBU/fi27VFO6+FywZhxc9YasS9/Lke9AGsZKFg08WZcRr2k/egIHyqCCHu3wDGIz4zZAwjl0Knoc4; _gcl_au=1.1.273681510.1709869801; _ga=GA1.2.1346438449.1709869802; _gid=GA1.2.62121280.1709869802; _scid=8f6d7662-9897-4b94-881f-d67e3b001ab9; _tt_enable_cookie=1; _ttp=A0IKAUphZxJGMN9O6aFYfCyWFCk; _clck=1fpjiod%7C2%7Cfjw%7C0%7C1528; _clsk=1dx59cs%7C1709869804670%7C1%7C0%7Co.clarity.ms%2Fcollect; _sctr=1%7C1709848800000; __zlcmid=1KgmYJwXpFxUy2p; _etc=wnSVH9fA524SVis0; _scid_r=8f6d7662-9897-4b94-881f-d67e3b001ab9; _uetsid=f1249a80dcfe11ee85cca9272729f636; _uetvid=f124ec80dcfe11ee89c513fa0ac4f478; bm_sv=4914AFC4F9270636CCA3875D0D36200C~YAAQITwSAvaJVgqOAQAAYF0vHBcwltrZwupSvjRbK9no2wsgh+USMEbpOBGflOh2HJDWN2HwtVqj3pl1ayh+p1mMJjtVSZoeTAnxQEKtS5nnSG6Os4dVMbSWmytI3tMM2g7DWSlSCVNYzf4oWO6wO6QtAsQRCIlIDRx0dfQky16NcmXJJeeIAK3Io9imNEzDzuUbGl/Mwsrz8eTUl/WZ1zFK6M8AK5MBXkZj6rTheRL3nQWqW2RN8VPoTz/VTw==~1; RT="z=1&dm=noon.com&si=0492jcodha9v&ss=lti4buki&sl=2&tt=a91&rl=1&ld=16u2&ul=1yli"\' \\',
    "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0`,
  },
};

const fetchPrice = async (url: string) => {
  try {
    const isNoonRequest = url.includes("noon");
    const currentAxisoConfig = isNoonRequest ? noonAxisoConfigs : axiosConfig;

    const response = await axios.get(url, currentAxisoConfig);

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
