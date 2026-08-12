export type DailyCodeResult = {
  first: string;
  second: string;
};

export function validateDailyCodeInput(serial: string, date: string): {
  serial: string;
  date: string;
} {
  const normalizedSerial = serial.trim();
  if (!/^\d{5,9}$/.test(normalizedSerial)) {
    throw new Error('Enter a numeric crane serial with 5 to 9 digits.');
  }
  if (!/^\d{6}$/.test(date)) {
    throw new Error('Enter the date as DDMMYY, for example 010126.');
  }

  const day = Number(date.slice(0, 2));
  const month = Number(date.slice(2, 4));
  const year = 2000 + Number(date.slice(4, 6));
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    throw new Error('Enter a valid date as DDMMYY.');
  }

  return { serial: normalizedSerial, date };
}

/** Exact server-side port of the recovered LICCON daily-code routine. */
export function generateDailyCodes(serial: string, date: string): DailyCodeResult {
  const input = validateDailyCodeInput(serial, date);
  const day = Number(input.date.slice(0, 2));
  const month = Number(input.date.slice(2, 4));
  const d1 = Number(input.date[1]);
  const d2 = Number(input.date[0]);
  const m1 = Number(input.date[3]);
  const m2 = Number(input.date[2]);
  const dateDigitTotal = d2 + d1 + m2 + m1;
  let workingSerial = input.serial.padStart(9, '0');
  const codes: number[] = [];

  for (let pass = 0; pass < 2; pass += 1) {
    const digits: number[] = Array<number>(10).fill(0);
    let serialDigitTotal = 0;

    for (const character of workingSerial) serialDigitTotal += Number(character);
    for (let index = 0; index < workingSerial.length; index += 1) {
      digits[workingSerial.length - index] = Number(workingSerial[index]);
    }

    const combined = serialDigitTotal + digits[d2] + digits[d1] + digits[m2] + digits[m1];
    const multiplier = (d1 ^ digits[d1]) + day + month;
    const product = combined * multiplier;
    const reversedProductDigits: number[] = Array<number>(5).fill(0);
    const productText = String(product);

    for (let index = 0; index < productText.length; index += 1) {
      reversedProductDigits[index + 1] = Number(productText[productText.length - index - 1]);
    }

    const assembled = Number(
      `${reversedProductDigits[3]}${reversedProductDigits[2]}${reversedProductDigits[2]}${reversedProductDigits[1]}`,
    );
    let nextSerial = assembled + dateDigitTotal * 10;
    if (nextSerial > 10000) nextSerial -= 10000;
    codes.push(nextSerial);
    if (pass === 0) workingSerial = String(nextSerial).padStart(9, '0');
  }

  return {
    first: String(codes[0]).padStart(4, '0'),
    second: String(codes[1]).padStart(4, '0'),
  };
}
