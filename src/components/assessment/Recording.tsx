// components/Recording.js
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Recording = () => (
  <Card>
    <CardHeader>Recording</CardHeader>
    <CardContent>
      <div className="bg-gray-200 h-12 rounded-full flex items-center px-4">
        <Button className="rounded-full bg-blue-300 text-white w-8 h-8 flex items-center justify-center">▶</Button>
        <div className="flex-1 mx-4 h-2 bg-blue-500 rounded-full relative">
          <div className="absolute right-1/4 w-1 h-8 bg-yellow-400 top-1/2 transform -translate-y-1/2"></div>
        </div>
        <span>02:10</span>
      </div>
    </CardContent>
  </Card>
);