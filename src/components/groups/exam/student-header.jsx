import React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  CalendarClock,
  CircleGauge,
  FileDigit,
  Percent,
  Trophy,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ExamStudentHeader({ student, questions, loading }) {
  function formatDate(timestamp) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  }

  if (loading) {
    return (
      <div className="space-y-2 py-4 w-full border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-20" />
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
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-2 pb-4 w-full border-b border-border">
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-semibold">
          {student?.fullName}
        </h1>
        <Badge
          variant={student?.correctPercentage >= 70 ? 'active' : 'inactive'}
        >
          {student?.correctPercentage >= 70 ? "O'tdi" : "O'ta olmadi"}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <p className={student?.results ? 'text-green-500' : 'text-red-500'}>
            {student?.results ? 'Topshirdi' : 'Topshirmadi'}
          </p>
        </div>
        {student?.results && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <p className="text-xs md:text-sm">
              {formatDate(student?.timestamp)}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CircleGauge className="h-4 w-4" />
          <p className="text-xs md:text-sm">
            {student?.results
              ? `${student?.correctCount}/${questions?.length}`
              : `0/${questions?.length}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <p className="text-xs md:text-sm">
            {student?.results ? `${student?.correctPercentage}%` : '0%'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExamStudentHeader;
