export const handleAsyncError = async (fn: () => Promise<void>) => {
  try {
    await fn();
  } catch(error) {
    console.log('error', error);
  }
}

export const handleError = (fn: () => void) => {
  try {
    fn();
  } catch(error) {
    console.log('error', error);
  }
}
