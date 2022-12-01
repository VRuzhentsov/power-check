
function until(conditionFunction): Promise<() => void> {

    const poll = (resolve) => {
        if(conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 400);
    }

    return new Promise(poll);
}

const main = async(): Promise<void> => {
    console.log("[main] program start");

    // eslint-disable-next-line
    let running = true;

    await until(_ => running !== true);
    finishProcess();
};

await main();

process.on('uncaughtException', (error: Error, promise: Promise<any>) => {
    console.error("[main] uncaughtException", {
        body: error
    });
    finishProcess()
});
process.on('unhandledRejection', (error: Error, promise: Promise<any>) => {
    console.error("[main] unhandledRejection", {
        body: error
    });
    finishProcess()
});

const finishProcess = () => {
    console.log("[main] Finishing app");
    process.exit(0);
}

export {}
