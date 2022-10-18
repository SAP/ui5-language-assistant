export const init = async (documentPath: string) => {
  // init project initialization
  setTimeout(() => {
    console.log("from ui5 OData extension", documentPath);
    return Promise.resolve(documentPath);
  }, 5000);
};
