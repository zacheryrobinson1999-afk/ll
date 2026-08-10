/**
 * Daily access-code generator — algorithm recovered from the original LTC APK.
 *
 * Exported so it can be used by both the Instrument tab and anywhere in the
 * Maintenance tab (Liebherr crane detail).
 */

export type DailyCodeResult = {
  first: string;
  second: string;
};

/** Returns today's date in the legacy DDMMYY format required by the algorithm. */
export function makeLegacyDate(): string {
  const now = new Date();
  const day   = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year  = String(now.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
}

/**
 * Reproduces the daily-code routine recovered from the original LTC APK.
 * The legacy app expects dates as DDMMYY and performs two passes; the first
 * result becomes the serial for the second pass.
 */
export function generateDailyCodes(serial: string, date: string): DailyCodeResult {
  const normalizedSerial = serial.trim();
  if (!/^\d{5,9}$/.test(normalizedSerial)) {
    throw new Error('Enter a numeric crane serial with 5 to 9 digits.');
  }
  if (!/^\d{6}$/.test(date)) {
    throw new Error('Enter the date as DDMMYY, for example 010126.');
  }

  const day   = Number(date.slice(0, 2));
  const month = Number(date.slice(2, 4));
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    throw new Error('Enter a valid date as DDMMYY.');
  }

  const d1 = Number(date[1]);
  const d2 = Number(date[0]);
  const m1 = Number(date[3]);
  const m2 = Number(date[2]);
  const dateDigitTotal = d2 + d1 + m2 + m1;
  let workingSerial = normalizedSerial.padStart(9, '0');
  const codes: number[] = [];

  for (let pass = 0; pass < 2; pass += 1) {
    const digits: number[] = Array<number>(10).fill(0);
    let serialDigitTotal = 0;

    for (const character of workingSerial) {
      serialDigitTotal += Number(character);
    }

    // The old Basic4Android routine stores the serial digits in reverse
    // order, indexed by position 1..9, then looks up the date digits.
    for (let index = 0; index < workingSerial.length; index += 1) {
      digits[workingSerial.length - index] = Number(workingSerial[index]);
    }

    const combined    = serialDigitTotal + digits[d2] + digits[d1] + digits[m2] + digits[m1];
    const multiplier  = (d1 ^ digits[d1]) + day + month;
    const product     = combined * multiplier;
    const reversedProductDigits: number[] = Array<number>(5).fill(0);
    const productText = String(product);

    for (let index = 0; index < productText.length; index += 1) {
      reversedProductDigits[index + 1] = Number(productText[productText.length - index - 1]);
    }

    // This intentionally mirrors the legacy routine, including the repeated
    // second digit used by its four-digit assembly.
    const assembled = Number(
      `${reversedProductDigits[3]}${reversedProductDigits[2]}${reversedProductDigits[2]}${reversedProductDigits[1]}`,
    );
    let nextSerial = assembled + dateDigitTotal * 10;
    if (nextSerial > 10000) nextSerial -= 10000;
    codes.push(nextSerial);

    if (pass === 0) workingSerial = String(nextSerial).padStart(9, '0');
  }

  return {
    first:  String(codes[0]).padStart(4, '0'),
    second: String(codes[1]).padStart(4, '0'),
  };
}
