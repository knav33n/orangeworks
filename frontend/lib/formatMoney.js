export default function formatMoney(amount = 0) {
  let options = {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  };

  if (amount % 100 === 0) {
    options.minimumFractionDigits = 0;
  }

  const formatter = Intl.NumberFormat("en-IN", options);

  return formatter.format(amount);
}
