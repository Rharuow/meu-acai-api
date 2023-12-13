interface MyObject {
  [key: string]: boolean | undefined;
}

// Your function that checks the condition
export function isBooleanAttribute(obj: MyObject, attribute: string): boolean {
  return obj[attribute] !== undefined && typeof obj[attribute] === "boolean";
}
