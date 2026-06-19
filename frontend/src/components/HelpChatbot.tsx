import { useState } from "react";
import { Bot, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import type { TranslationKey } from "@/lib/i18n";

type HelpTopic = {
  key: TranslationKey;
  answerKey: TranslationKey;
};

const usageTopics: HelpTopic[] = [
  { key: "help.usage.upload", answerKey: "help.usage.uploadAnswer" },
  { key: "help.usage.summarize", answerKey: "help.usage.summarizeAnswer" },
  { key: "help.usage.translate", answerKey: "help.usage.translateAnswer" },
  { key: "help.usage.results", answerKey: "help.usage.resultsAnswer" },
];

const issueTopics: HelpTopic[] = [
  { key: "help.issues.login", answerKey: "help.issues.loginAnswer" },
  { key: "help.issues.password", answerKey: "help.issues.passwordAnswer" },
  { key: "help.issues.processing", answerKey: "help.issues.processingAnswer" },
  { key: "help.issues.language", answerKey: "help.issues.languageAnswer" },
];

type HelpChatbotProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HelpChatbot({ open, onOpenChange }: HelpChatbotProps) {
  const { t } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleTopic = (answerKey: TranslationKey) => {
    setSelectedAnswer(t(answerKey));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedAnswer(null);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="border-b bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#163a5f] text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">{t("help.title")}</DialogTitle>
              <DialogDescription className="text-xs">{t("help.subtitle")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-4">
          {selectedAnswer ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t("help.assistant")}
                </div>
                {selectedAnswer}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setSelectedAnswer(null)}>
                {t("help.askAnother")}
              </Button>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("help.usage.title")}
                </p>
                <div className="flex flex-col gap-2">
                  {usageTopics.map((topic) => (
                    <button
                      key={topic.key}
                      type="button"
                      onClick={() => handleTopic(topic.answerKey)}
                      className="rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition hover:bg-muted/40"
                    >
                      {t(topic.key)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("help.issues.title")}
                </p>
                <div className="flex flex-col gap-2">
                  {issueTopics.map((topic) => (
                    <button
                      key={topic.key}
                      type="button"
                      onClick={() => handleTopic(topic.answerKey)}
                      className="rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition hover:bg-muted/40"
                    >
                      {t(topic.key)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
