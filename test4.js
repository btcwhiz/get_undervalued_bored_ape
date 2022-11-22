const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
const sleeping = async () => {
  console.log("aa");
  await sleep(2000);
  console.log("aa");
};

sleeping();
