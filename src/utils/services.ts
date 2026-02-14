export const extractQuery = (query: any) => {
  return new URLSearchParams(
    Object.fromEntries(
      Object.entries(query).map(([key, value]) => [key, String(value)])
    )
  ).toString();
};