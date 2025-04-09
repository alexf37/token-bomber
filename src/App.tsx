import "../styles/globals.css";

import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Copy, Download, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { confusify, insertZeroWidthChars } from "./token-bomber";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Checkbox } from "./components/ui/checkbox";
import { Slider } from "./components/ui/slider";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

export function App() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldConfusify, setShouldConfusify] = useState(false);
  const [tokenCount, setTokenCount] = useState(30000);

  // Function to copy text to clipboard
  const copyToClipboard = () => {
    if (!outputText) return;

    const promise = navigator.clipboard.writeText(outputText);

    toast.promise(promise, {
      loading: "Loading...",
      success: () => {
        return `Text copied!`;
      },
      error: "Error",
    });
  };

  // Function to save text as a file
  const saveAsFile = () => {
    if (!outputText) return;

    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "modified-text.txt";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format token count for display
  function formatTokenCount(count: number) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(0) + "K";
    }
    return count.toString();
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-primary">
        <Analytics />
        <Toaster richColors />
        <div className="container max-w-4xl py-10 mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-primary">
                Zero-Width Character Inserter and Text Obfuscator
              </h1>
              <p className="text-muted-foreground mt-1 text-sm max-w-prose">
                Insert thousands of invisible tokens to confuse and exceed the
                context limits of LLMs and obfuscate text with identical-looking
                unicode characters.
              </p>
            </div>
            <ModeToggle />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Input
                </label>
              </div>
              <Textarea
                placeholder="Type or paste your text here..."
                className="min-h-[240px] max-h-96 bg-secondary placeholder:text-accent resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      Token Count: {formatTokenCount(tokenCount)}
                    </label>
                    <input
                      type="number"
                      min="1000"
                      max="2500000"
                      value={tokenCount}
                      onChange={(e) => setTokenCount(Number(e.target.value))}
                      className="w-24 text-sm bg-secondary border border-border rounded px-2 py-1 text-primary"
                    />
                  </div>
                  <Slider
                    value={[tokenCount]}
                    min={1000}
                    max={2500000}
                    step={1000}
                    onValueChange={(value) => setTokenCount(value[0])}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    const result = await insertZeroWidthChars(
                      shouldConfusify ? confusify(inputText) : inputText,
                      tokenCount
                    );
                    setOutputText(result);
                    setIsLoading(false);
                  }}
                  className="w-full bg-[#5E6AD2] hover:bg-[#4F5ABA] text-white rounded-md h-9 text-sm font-medium transition-colors"
                  disabled={!inputText}
                >
                  {isLoading ? (
                    <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Process</span>{" "}
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={shouldConfusify}
                    onCheckedChange={(checked) =>
                      setShouldConfusify(!!checked.valueOf())
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Obfuscate text with identical-looking unicode characters
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Output
                </label>
              </div>
              <Textarea
                placeholder="Processed text will appear here..."
                className="min-h-[240px] max-h-96 bg-secondary placeholder:text-accent resize-none"
                value={outputText}
                readOnly
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-1 transition-colors"
                  disabled={!outputText}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={saveAsFile}
                  className="flex-1 transition-colors"
                  disabled={!outputText}
                >
                  <Download className="mr-2 h-3.5 w-3.5" /> Save as .txt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
