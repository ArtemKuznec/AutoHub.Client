export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");

  let value = "+7";
  let index = 0;

  if (digits.startsWith("7")) {
    index = 1;
  } else if (digits.startsWith("8")) {
    index = 1;
  }

  const rest = digits.slice(index);

  if (rest.length > 0) {
    value += " (" + rest.slice(0, 3);
  }
  if (rest.length >= 3) {
    value += ") ";
  }
  if (rest.length > 3) {
    value += rest.slice(3, 6);
  }
  if (rest.length >= 6) {
    value += "-" + rest.slice(6, 8);
  }
  if (rest.length >= 8) {
    value += "-" + rest.slice(8, 10);
  }

  return value;
}
