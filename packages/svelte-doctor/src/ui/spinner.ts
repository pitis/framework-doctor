import ora from "ora";

let sharedInstance: ReturnType<typeof ora> | null = null;
let activeCount = 0;
const pendingTexts = new Set<string>();

const finalize = (method: "succeed" | "fail", originalText: string, displayText: string) => {
  pendingTexts.delete(originalText);
  activeCount -= 1;

  if (activeCount <= 0 || !sharedInstance) {
    sharedInstance?.[method](displayText);
    sharedInstance = null;
    activeCount = 0;
    return;
  }

  sharedInstance.stop();
  // Avoid printing an extra "spinner start" line for parallel tasks.
  ora({ text: displayText })[method](displayText);

  const [remainingText] = pendingTexts;
  if (remainingText) {
    sharedInstance.text = remainingText;
  }
  sharedInstance.start();
};

export const spinner = (text: string) => ({
  start() {
    activeCount += 1;
    pendingTexts.add(text);

    if (sharedInstance) {
      sharedInstance.text = text;
    } else {
      sharedInstance = ora({ text }).start();
    }

    return {
      succeed: (displayText: string) => finalize("succeed", text, displayText),
      fail: (displayText: string) => finalize("fail", text, displayText),
    };
  },
});
