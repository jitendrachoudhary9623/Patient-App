import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

const TableContent = ({ items, handleInputChange, handleInputFocus }) => (
  <table className="w-full">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 text-left">Observation</th>
        <th className="p-2 text-left">Current</th>
        <th className="p-2 text-left">History 1</th>
        <th className="p-2 text-left">History 2</th>
        <th className="p-2 text-left">History 3</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, index) => (
        <tr key={index} className="border-b">
          <td className="p-2 flex items-center">
            {item.label}
            {item.customExtension && (
              <Tooltip>
                <TooltipTrigger>
                  <Info className="ml-2 h-4 w-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Custom Extension: {item.customExtension}</p>
                  {item.recommendation && (
                    <p className="mt-1">Note: {item.recommendation}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </td>
          <td className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  value={item.value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onFocus={() => handleInputFocus(item.regex)}
                  className="h-8 w-full"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter value matching: {item.regex.toString()}</p>
              </TooltipContent>
            </Tooltip>
          </td>
          {[0, 1, 2].map((historyIndex) => (
            <td key={historyIndex} className="p-2 text-xs">
              {item.history[historyIndex] && (
                <>
                  <div>{item.history[historyIndex].value}</div>
                <div className="text-gray-500">
                  {new Date(item.history[historyIndex].date).toLocaleDateString()} {new Date(item.history[historyIndex].date).toLocaleTimeString()}
                </div>                </>
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const ObservationsTable = ({ observations, handleInputChange, handleInputFocus }) => {
  const [isTabbed, setIsTabbed] = useState(false);

  const groupedObservations = useMemo(() => {
    return observations.reduce((acc, obs) => {
      const category = obs.fhirResource || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(obs);
      return acc;
    }, {});
  }, [observations]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="tabbed-mode"
            checked={isTabbed}
            onCheckedChange={setIsTabbed}
          />
          <Label htmlFor="tabbed-mode">Tabbed Mode</Label>
        </div>
        
        <div className="border rounded-md">
          {isTabbed ? (
            <Tabs defaultValue={Object.keys(groupedObservations)[0]}>
              <TabsList className="bg-muted p-1">
                {Object.keys(groupedObservations).map((category) => (
                  <TabsTrigger key={category} value={category} className="data-[state=active]:bg-background">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(groupedObservations).map(([category, items]) => (
                <TabsContent key={category} value={category} className="p-4">
                  <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                    <TableContent
                      items={items}
                      handleInputChange={handleInputChange}
                      handleInputFocus={handleInputFocus}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <TableContent
                items={observations}
                handleInputChange={handleInputChange}
                handleInputFocus={handleInputFocus}
              />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};