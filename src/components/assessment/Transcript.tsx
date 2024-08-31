import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export const Transcript = ({ transcript, transcriptRef }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matches, setMatches] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      highlightMatches();
    } else {
      clearHighlights();
    }
  }, [searchTerm, transcript]);

  const highlightMatches = () => {
    if (!transcriptRef.current) return;

    clearHighlights();

    const regex = new RegExp(searchTerm, 'gi');
    const content = transcriptRef.current.innerHTML;
    const newContent = content.replace(regex, match => `<mark class="bg-yellow-200">${match}</mark>`);
    transcriptRef.current.innerHTML = newContent;

    const newMatches = transcriptRef.current.querySelectorAll('mark');
    setMatches(Array.from(newMatches));
    setTotalMatches(newMatches.length);
    setCurrentMatch(newMatches.length > 0 ? 1 : 0);

    if (newMatches.length > 0) {
      scrollToMatch(newMatches[0]);
    }
  };

  const clearHighlights = () => {
    if (!transcriptRef.current) return;

    const highlights = transcriptRef.current.querySelectorAll('mark');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  };

  const scrollToMatch = (element) => {
    if (containerRef.current && element) {
      const container = containerRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollTop = element.offsetTop - containerRect.height / 2 + elementRect.height / 2;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  };

  const handleSearch = () => {
    highlightMatches();
  };

  const handleNextMatch = () => {
    if (currentMatch < totalMatches) {
      setCurrentMatch(currentMatch + 1);
      scrollToMatch(matches[currentMatch]);
    }
  };

  const handlePreviousMatch = () => {
    if (currentMatch > 1) {
      setCurrentMatch(currentMatch - 1);
      scrollToMatch(matches[currentMatch - 2]);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Transcript</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search transcript..."
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Button onClick={handleSearch} variant="default">
            Search
          </Button>
          <Button
            onClick={handlePreviousMatch}
            disabled={currentMatch <= 1}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleNextMatch}
            disabled={currentMatch >= totalMatches}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {totalMatches > 0 ? `${currentMatch}/${totalMatches}` : "No matches"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="h-[400px] overflow-y-auto overflow-x-hidden relative p-4 bg-gray-50 rounded-lg prose prose-sm max-w-none"
        >
          <div ref={transcriptRef}>{transcript}</div>
        </div>
      </CardContent>
    </Card>
  );
};