import "../styles/globals.css";

import { useState } from "react";
import { Copy, Download, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { confusify, insertZeroWidthChars } from "./token-bomber";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Checkbox } from "./components/ui/checkbox";

export function App() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldConfusify, setShouldConfusify] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#101112] text-[#E1E1E2]">
      <Toaster richColors />
      <div className="container max-w-4xl py-10 mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight text-white">
            Zero-Width Character Inserter and Text Obfuscator
          </h1>
          <p className="text-[#8A8A8D] mt-1 text-sm">
            Insert millions of invisible tokens to exceed context limits of LLMs
            and obfuscate text with identical-looking unicode characters.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#8A8A8D]">
                Input
              </label>
            </div>
            <Textarea
              placeholder="Type or paste your text here..."
              className="min-h-[240px] max-h-96 bg-[#17181A] border-[#27282A] rounded-md text-[#E1E1E2] placeholder:text-[#4D4D4F] resize-none focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button
              onClick={async () => {
                setIsLoading(true);
                const result = await insertZeroWidthChars(
                  shouldConfusify ? confusify(inputText) : inputText
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
              <span className="text-sm text-[#8A8A8D]">
                Confusify text with identical-looking unicode characters
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#8A8A8D]">
                Output
              </label>
            </div>
            <Textarea
              placeholder="Processed text will appear here..."
              className="min-h-[240px] max-h-96 bg-[#17181A] border-[#27282A] rounded-md text-[#E1E1E2] placeholder:text-[#4D4D4F] resize-none"
              value={outputText}
              readOnly
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex-1 bg-transparent border border-[#27282A] hover:bg-[#27282A] text-[#E1E1E2] rounded-md h-9 text-sm font-medium transition-colors"
                disabled={!outputText}
              >
                <Copy className="mr-2 h-3.5 w-3.5" /> Copy
              </Button>
              <Button
                variant="outline"
                onClick={saveAsFile}
                className="flex-1 bg-transparent border border-[#27282A] hover:bg-[#27282A] text-[#E1E1E2] rounded-md h-9 text-sm font-medium transition-colors"
                disabled={!outputText}
              >
                <Download className="mr-2 h-3.5 w-3.5" /> Save as .txt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
