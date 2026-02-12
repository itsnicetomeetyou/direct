import moment from "moment";

export function notApplicable(text: string | null) {
  return text ? text : "N/A";
}

export const truncateString = (str: string, maxLength: number): string => {
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};

// currencyFormatter.ts
export const formatCurrency = (amount: number, currency: string = "PHP"): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(amount);
};

export const getGreeting = () => {
  const currentHour = moment().hour();
  if (currentHour < 12) {
    return "Good Morning!";
  } else if (currentHour < 18) {
    return "Good Afternoon!";
  } else {
    return "Good Evening!";
  }
};
