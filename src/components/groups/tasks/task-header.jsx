import React from 'react';

import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function TaskHeader({ task, loading }) {
  if (loading) {
    return (
      <div className="space-y-2 py-4 w-full border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-1/3" />
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-1 text-xs md:text-sm">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="text-xs md:text-sm">
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2 py-4 w-full border-b border-border">
      <div>
        <h1 className="text-lg md:text-xl font-semibold">{task?.title}</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {task?.description}
        </p>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* <div className="flex items-center gap-1 text-xs md:text-sm">
          <Badge className="px-1.5">3</Badge>
          <span>Attachments</span>
        </div>
        <div className="flex items-center gap-1 text-xs md:text-sm">
          <Badge className="px-1.5">0</Badge>
          <span>Message</span>
        </div> */}
        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{task?.due}</span>
        </div>
      </div>
    </div>
  );
}

export default TaskHeader;
