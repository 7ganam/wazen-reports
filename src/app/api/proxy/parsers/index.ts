import cheerio, { load } from "cheerio";
import fs from "fs";
type parserReturn = {
  available: boolean;
  price: number;
  url: string;
};

export const parse = async (
  html: string,
  url: string
): Promise<parserReturn> => {
  if (url.includes("elsindbadstore")) {
    return parseElsindbad(html, url);
  } else if (url.includes("amazon")) {
    return parseAmazon(html, url);
  } else if (url.includes("btech")) {
    return parseBtech(html, url);
  } else if (url.includes("noon")) {
    return parseNoon(html, url);
  } else if (url.includes("cairosales")) {
    return parseCairoSales(html, url);
  } else if (url.includes("eliraqi")) {
    return parseEliraqi(html, url);
  } else if (url.includes("ehabcenter")) {
    return parseEhabCenter(html, url);
  } else if (url.includes("raneen")) {
    return parseRaneen(html, url);
  } else if (url.includes("elghazawy")) {
    return parseElghazawy(html, url);
  } else if (url.includes("rayashop")) {
    return parseRayaShop(html, url);
  } else if (url.includes("jumia")) {
    return parseJumia(html, url);
  }

  return {
    available: false,
    price: 0,
    url: url,
  };
};

const parseElsindbad = (html: string, url: string): parserReturn => {
  const $ = load(html);

  let available = false;
  let price = 0;

  const stockElement2 = $(".stock.available span");
  if (stockElement2.length > 0) {
    const stockText = stockElement2.text().trim();
    console.log(stockText);
    if (stockText === "متوفر") {
      available = true;
    }
  } else {
    console.log('Element with class "stock unavailable" not found.');
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  // Find the span with data-price-type="finalPrice" that contains a span with class "price"
  const finalPriceSpan = $(
    'span[data-price-type="finalPrice"]:has(span.price)'
  );

  if (finalPriceSpan.length > 0) {
    // Select the inner text of the span with class "price" within the found element
    const innerText = finalPriceSpan.find("span.price").first().text();
    const numericPart = innerText.replace(/[^\d.]/g, "");
    console.log(numericPart);
    price = parseInt(numericPart);
  } else {
    console.log(
      'Element with data-price-type="finalPrice" and class "price" not found.'
    );
  }

  return {
    available,
    price,
    url,
  };
};

const parseAmazon = (html: string, url: string): parserReturn => {
  const $ = load(html);

  $("script").remove();
  $("style").remove();

  let available = false;
  let price = 0;
  if (
    ($.html().includes("أضف إلى العربة") &&
      $.html().includes("shipsFromSoldByODF")) ||
    ($.html().includes("Add to Cart") &&
      $.html().includes("shipsFromSoldByODF"))
  ) {
    available = true;
    console.log("available");
  } else {
    console.log("not available");
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $("span.a-price-whole");

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);

    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseBtech = (html: string, url: string): parserReturn => {
  // save html to file
  const $ = load(html);

  let available = false;
  let price = 0;

  // Select the label with the specific selector
  const availabilityLabel = $(".stock.unavailable label");

  // Check if the element is found
  if (availabilityLabel.length > 0) {
    // Extract the text content
    const availabilityText = availabilityLabel.text().trim();
    if (
      !availabilityText.includes("قريب") &&
      !availabilityText.includes("هيتوفر")
    ) {
      available = true;
    }
    console.log("availabilityText", availabilityText);
  } else {
    console.log(
      "Availability label element not found..in this case it means available"
    );
    available = true;
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $(`span[data-price-type="finalPrice"] :nth-child(1)`);

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);

    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseNoon = (html: string, url: string): parserReturn => {
  const $ = load(html);

  $("script").remove();
  $("style").remove();
  $("noscript").remove();

  let available = false;
  let price = 0;

  // Select the label with the specific selector

  // Check if the element is found
  if (!$.html().includes("مش موجود")) {
    available = true;
    console.log("available");
  } else {
    console.log("Elemnet not available");
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $(".priceNow");

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);

    // Remove non-numeric characters except .
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseCairoSales = (html: string, url: string): parserReturn => {
  // save html to file
  const $ = load(html);

  let available = false;
  let price = 0;

  // Select the label with the specific selector
  const availabilityLabel = $(".stock.unavailable label");

  const priceSpan = $("#our_price_display");

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    available = true;
    console.log("available");
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);
    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseEliraqi = (html: string, url: string): parserReturn => {
  const $ = load(html);

  let available = false;
  let price = 0;

  // Check if the element is found
  if (!html.includes("اخطرني حين يكون متاحا")) {
    available = true;
    console.log("available");
  } else {
    console.log("Elemnet not available");
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $(".price .product-price span");

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);

    // Remove non-numeric characters except .
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseEhabCenter = (html: string, url: string): parserReturn => {
  // save html to file
  const $ = load(html);

  $("script").remove();
  $("style").remove();

  let available = false;
  let price = 0;

  // Check if the element is found
  if ($.html().includes("متوفر في المخزون") || $.html().includes("In stock")) {
    available = true;
  }
  if ($.html().includes("غير متوفر في المخزون")) {
    available = false;
  }

  console.log("available:", available);

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $(".woocommerce-Price-amount bdi");

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    console.log("available");
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);
    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseRaneen = (html: string, url: string): parserReturn => {
  // save html to file
  const $ = load(html);

  $("script").remove();
  $("style").remove();

  let available = false;
  let price = 0;

  if ($.html().includes("In stock") || $.html().includes("متوفر فى")) {
    available = true;
    console.log("available");
  } else {
    console.log("Elemnet not available");
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $('span[data-price-type="finalPrice"] .price');

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    console.log("available");
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);
    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseElghazawy = (html: string, url: string): parserReturn => {
  // save html to file
  const $ = load(html);

  $("script").remove();
  $("style").remove();

  let available = false;
  let price = 0;

  if ($.html().includes("ADD TO CART") || $.html().includes("ضف لسلة")) {
    available = true;
    console.log("available");
  } else {
    console.log("Elemnet not available");
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $(
    ".product-info .h2-price.pro-praice.text-primary-800.font-m"
  );

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    console.log("available");
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);
    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseRayaShop = (html: string, url: string): parserReturn => {
  // save html to file
  const $ = load(html);

  $("script").remove();
  $("style").remove();

  let available = false;
  let price = 0;

  if ($.html().includes("Add To Cart") || $.html().includes("ضف للعربة")) {
    available = true;
    console.log("available");
    console.log("Elemnet not available");
  } else {
    console.log("Elemnet not available");
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const priceSpan = $(
    'span[data-after-content="EGP"] , span[data-after-content="ج م"]'
  );

  // Check if the element is found
  if (priceSpan.length > 0) {
    // Extract the text content
    console.log("available");
    const priceText = priceSpan.first().text().trim();
    console.log(priceText);
    let priceTextEnglish = priceText;
    if (isArabicNumber(priceText)) {
      priceTextEnglish = convertArabicToEnglishNumbers(priceText);
      console.log(priceTextEnglish); // Output: 590
    }
    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

const parseJumia = (html: string, url: string): parserReturn => {
  // save html to file
  const $ = load(html);

  $("script").remove();
  $("style").remove();

  let available = false;
  let price = 0;

  if (
    ($.html().includes("اضافة لسلة التسوق") ||
      $.html().includes("Add to cart")) &&
    $.html().includes("#add-cart")
  ) {
    available = true;
    console.log("available");
  } else {
    console.log("not available");
  }

  if (!available) {
    return {
      available: false,
      price: 0,
      url,
    };
  }

  const regexE = /EGP [\d,.]+/;
  const priceTextEnglishI = find1stInstance($.html(), regexE);
  const regexA = /جنيه [\d,.]+/;
  const priceTextArabicI = find1stInstance($.html(), regexA);

  // Check if the element is found
  if (priceTextEnglishI || priceTextArabicI) {
    const priceText = priceTextEnglishI || priceTextArabicI;

    console.log(priceText);
    let priceTextEnglish = priceText;
    if (isArabicNumber(priceText)) {
      priceTextEnglish = convertArabicToEnglishNumbers(priceText);
      console.log(priceTextEnglish); // Output: 590
    }
    // Remove non-numeric characters
    const numericPart = priceText.replace(/[^\d.]/g, "");
    // Convert to number
    price = parseInt(numericPart);
    console.log(price);
  } else {
    console.log("Price element not found.");
  }

  return {
    available,
    price,
    url,
  };
};

//----------------------------------------------helpers----------------------------------------------

function isArabicNumber(str: string) {
  // Arabic/Indian numerals range: U+0660 to U+0669
  str = str.replace(/٬/g, "");
  const arabicNumeralRegex = /^[\u0660-\u0669]+$/;
  return arabicNumeralRegex.test(str);
}

function convertArabicToEnglishNumbers(str: string) {
  // remove any "٬" characters from string
  str = str.replace(/٬/g, "");
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  for (let i = 0; i < arabicNumerals.length; i++) {
    const arabicNumeral = arabicNumerals[i];
    const englishNumeral = i.toString();
    const regex = new RegExp(arabicNumeral, "g");
    str = str.replace(regex, englishNumeral);
  }

  return str;
}

function find1stInstance(str: string, regex: RegExp): string {
  const matches = str.match(regex) || [];
  const instances = matches.map(String);
  console.log(instances);
  if (instances.length > 0) {
    return instances[0];
  }
  return "";
}
