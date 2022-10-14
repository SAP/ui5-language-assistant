export const init = async (fileUri: string) => {
  // init project initialization
  setTimeout(() => {
    console.log("from ui5 OData extension", fileUri);
    return Promise.resolve(fileUri);
  }, 5000);
};
