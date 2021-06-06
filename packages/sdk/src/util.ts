export const toTitleCase = (str?: string) =>
    str
        ? str.replace(/(?:^|\s)\S/g, (match) => {
              return match.toUpperCase();
          })
        : "";
